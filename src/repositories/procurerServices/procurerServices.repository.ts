import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { DiscoveryInput, ProfileInput, ZoneInput, ZoneView, PricingPolicyInput, PricingPolicyView } from '../../models/procurerServices/procurerServices.model.js';
import { conflictError, permissionDeniedError } from '../../errors/auths/auth.error.js';

const eligible: Prisma.ProcurerProfileWhereInput = {
  status: 'ACTIVE',
  user: { status: 'ACTIVE', emailVerifiedAt: { not: null }, roleAssignments: { some: { role: 'PROCURER', revokedAt: null } },
    mfaFactors: { some: { enabledAt: { not: null }, disabledAt: null } } },
  application: { status: 'APPROVED', emailVerifiedAt: { not: null }, identityVerifiedAt: { not: null }, complianceVerifiedAt: { not: null },
    accountInvitations: { some: { kind: 'PROCURER', consumedAt: { not: null }, revokedAt: null, acceptedById: { not: null } } } }
};

export function eligibleOwner(userId: string): Prisma.ProcurerProfileWhereInput {
  return { ...eligible, application: { status: 'APPROVED', emailVerifiedAt: { not: null }, identityVerifiedAt: { not: null }, complianceVerifiedAt: { not: null },
    accountInvitations: { some: { kind: 'PROCURER', consumedAt: { not: null }, revokedAt: null, acceptedById: userId } } } };
}

export class PrismaProcurerServicesRepository implements ProcurerServicesRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async getOwn(userId: string) {
    const row = await this.prisma.procurerProfile.findUnique({ where: { userId }, include: { serviceZones: { orderBy: { createdAt: 'asc' } } } });
    return row && { userId: row.userId, status: row.status, publicName: row.publicName, biography: row.biography,
      acceptingRequests: row.acceptingRequests, zones: row.serviceZones.map(zoneView) };
  }
  async updateOwn(userId: string, input: ProfileInput) {
    const changed = await this.prisma.procurerProfile.updateMany({ where: { userId, ...eligibleOwner(userId) }, data: input });
    return changed.count ? this.getOwn(userId) : null;
  }
  async createZone(userId: string, input: ZoneInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const lock = await tx.procurerProfile.updateMany({ where: { userId, ...eligibleOwner(userId) }, data: { updatedAt: new Date() } });
        if (!lock.count) return null;
        const profile = await tx.procurerProfile.findUniqueOrThrow({ where: { userId }, select: { id: true } });
        return zoneView(await tx.procurerServiceZone.create({ data: { ...input, deliveryFeeMinor: BigInt(input.deliveryFeeMinor), profileId: profile.id } }));
      });
    } catch (error) { return handleConflict(error); }
  }
  async updateZone(userId: string, zoneId: string, input: ZoneInput) {
    try {
      return await this.prisma.$transaction(async (tx) => {
        const lock = await tx.procurerProfile.updateMany({ where: { userId, ...eligibleOwner(userId) }, data: { updatedAt: new Date() } });
        if (!lock.count) return null;
        const updated = await tx.procurerServiceZone.updateMany({ where: { id: zoneId, profile: { userId } }, data: { ...input, deliveryFeeMinor: BigInt(input.deliveryFeeMinor) } });
        if (!updated.count) return null;
        return zoneView(await tx.procurerServiceZone.findUniqueOrThrow({ where: { id: zoneId } }));
      });
    } catch (error) { return handleConflict(error); }
  }
  async findPricingForLocation(userId: string, location: Pick<DiscoveryInput, 'country' | 'region' | 'city' | 'area'>) {
    const zone = await this.prisma.procurerServiceZone.findFirst({ where: { country: location.country, region: location.region, city: location.city, area: location.area, active: true,
      profile: { userId, ...eligibleOwner(userId), acceptingRequests: true, publicName: { not: null }, pricingPolicies: { some: {} } } },
      include: { profile: { include: { pricingPolicies: { orderBy: { version: 'desc' }, take: 1 } } } } });
    if (!zone || !zone.profile.pricingPolicies[0]) return null;
    return { zone: zoneView(zone), pricing: policyView(zone.profile.pricingPolicies[0]) };
  }
  async getPricing(userId: string) {
    const policy = await this.prisma.procurerPricingPolicy.findFirst({ where: { profile: { userId } }, orderBy: { version: 'desc' } });
    return policy ? policyView(policy) : null;
  }
  async updatePricing(userId: string, input: PricingPolicyInput) {
    return this.prisma.$transaction(async (tx) => {
      const locked = await tx.procurerProfile.updateMany({ where: { userId, ...eligibleOwner(userId), pricingVersion: input.expectedVersion }, data: { pricingVersion: { increment: 1 } } });
      if (!locked.count) {
        const eligibleProfile = await tx.procurerProfile.findFirst({ where: { userId, ...eligibleOwner(userId) }, select: { id: true } });
        if (!eligibleProfile) throw permissionDeniedError();
        throw conflictError('Pricing policy has changed. Reload and retry.');
      }
      const profile = await tx.procurerProfile.findUniqueOrThrow({ where: { userId }, select: { id: true, pricingVersion: true } });
      const policy = await tx.procurerPricingPolicy.create({ data: { profileId: profile.id, version: profile.pricingVersion, currency: input.currency,
        fixedFeeMinor: BigInt(input.fixedFeeMinor), thresholdMinor: BigInt(input.thresholdMinor), percentageBasisPoints: input.percentageBasisPoints } });
      return policyView(policy);
    });
  }
  async discover(input: DiscoveryInput) {
    const zones = await this.prisma.procurerServiceZone.findMany({
      where: { country: input.country, region: input.region, city: input.city, area: input.area, active: true,
        profile: { ...eligible, acceptingRequests: true, publicName: { not: null }, pricingPolicies: { some: {} } } },
      include: { profile: { include: { pricingPolicies: { orderBy: { version: 'desc' }, take: 1 }, application: { select: { accountInvitations: { where: { kind: 'PROCURER', consumedAt: { not: null }, revokedAt: null }, select: { acceptedById: true } } } } } } }, orderBy: [{ profile: { publicName: 'asc' } }, { id: 'asc' }], skip: input.offset, take: input.limit
    });
    return zones.filter((row) => row.profile.application.accountInvitations.some((invitation) => invitation.acceptedById === row.profile.userId)).map((row) => ({ userId: row.profile.userId, publicName: row.profile.publicName!, biography: row.profile.biography,
      zone: zoneView(row), pricing: policyView(row.profile.pricingPolicies[0]!) }));
  }
}
function zoneView(row: { id: string; country: string; region: string; city: string; area: string; deliveryFeeMinor: bigint; currency: string; active: boolean }): ZoneView {
  return { id: row.id, country: row.country, region: row.region, city: row.city, area: row.area,
    deliveryFeeMinor: row.deliveryFeeMinor.toString(), currency: 'NGN', active: row.active };
}
function handleConflict(error: unknown): never {
  if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === 'P2002') throw conflictError('A service zone for this location already exists.');
  throw error;
}

function policyView(row: { id: string; version: number; currency: string; fixedFeeMinor: bigint; thresholdMinor: bigint; percentageBasisPoints: number; createdAt: Date }): PricingPolicyView {
  return { id: row.id, version: row.version, currency: 'NGN', fixedFeeMinor: row.fixedFeeMinor.toString(), thresholdMinor: row.thresholdMinor.toString(), percentageBasisPoints: row.percentageBasisPoints, createdAt: row.createdAt.toISOString() };
}
