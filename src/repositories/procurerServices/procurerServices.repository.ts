import { Prisma, PrismaClient } from '../../generated/prisma/client.js';
import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { DiscoveryInput, ProfileInput, ZoneInput, ZoneView } from '../../models/procurerServices/procurerServices.model.js';
import { conflictError } from '../../errors/auths/auth.error.js';

const eligible: Prisma.ProcurerProfileWhereInput = {
  status: 'ACTIVE',
  user: { status: 'ACTIVE', emailVerifiedAt: { not: null }, roleAssignments: { some: { role: 'PROCURER', revokedAt: null } },
    mfaFactors: { some: { enabledAt: { not: null }, disabledAt: null } } },
  application: { status: 'APPROVED', emailVerifiedAt: { not: null }, identityVerifiedAt: { not: null }, complianceVerifiedAt: { not: null },
    accountInvitations: { some: { kind: 'PROCURER', consumedAt: { not: null }, revokedAt: null, acceptedById: { not: null } } } }
};

function eligibleOwner(userId: string): Prisma.ProcurerProfileWhereInput {
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
  async discover(input: DiscoveryInput) {
    const zones = await this.prisma.procurerServiceZone.findMany({
      where: { country: input.country, region: input.region, city: input.city, area: input.area, active: true,
        profile: { ...eligible, acceptingRequests: true, publicName: { not: null } } },
      include: { profile: { include: { application: { select: { accountInvitations: { where: { kind: 'PROCURER', consumedAt: { not: null }, revokedAt: null }, select: { acceptedById: true } } } } } } }, orderBy: [{ profile: { publicName: 'asc' } }, { id: 'asc' }], skip: input.offset, take: input.limit
    });
    return zones.filter((row) => row.profile.application.accountInvitations.some((invitation) => invitation.acceptedById === row.profile.userId)).map((row) => ({ userId: row.profile.userId, publicName: row.profile.publicName!, biography: row.profile.biography,
      zone: zoneView(row) }));
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
