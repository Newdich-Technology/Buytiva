import type { PrismaClient } from '../../generated/prisma/client.js';
import type { AddressRepository } from '../../interfaces/addresses/addressRepository.interface.js';
import type { AddressInput, AddressView } from '../../models/addresses/address.model.js';

type Row = AddressInput & { id: string; createdAt: Date; updatedAt: Date };
function view(row: Row): AddressView {
  return { id: row.id, label: row.label, line1: row.line1, line2: row.line2, country: row.country, region: row.region, city: row.city, area: row.area,
    createdAt: row.createdAt.toISOString(), updatedAt: row.updatedAt.toISOString() };
}
export class PrismaAddressRepository implements AddressRepository {
  constructor(private readonly prisma: PrismaClient) {}
  async create(ownerId: string, input: AddressInput) { return view(await this.prisma.customerAddress.create({ data: { ...input, customerId: ownerId } })); }
  async get(ownerId: string, id: string) {
    const row = await this.prisma.customerAddress.findFirst({ where: { customerId: ownerId, id } });
    return row ? view(row) : null;
  }
  async list(ownerId: string, offset: number, limit: number) {
    return (await this.prisma.customerAddress.findMany({ where: { customerId: ownerId }, orderBy: [{ createdAt: 'desc' }, { id: 'desc' }], skip: offset, take: limit })).map(view);
  }
  async update(ownerId: string, id: string, input: AddressInput) {
    return this.prisma.$transaction(async (tx) => {
      const changed = await tx.customerAddress.updateMany({ where: { customerId: ownerId, id }, data: input });
      if (!changed.count) return null;
      return view(await tx.customerAddress.findUniqueOrThrow({ where: { id } }));
    });
  }
  async delete(ownerId: string, id: string) { return (await this.prisma.customerAddress.deleteMany({ where: { customerId: ownerId, id } })).count === 1; }
}
