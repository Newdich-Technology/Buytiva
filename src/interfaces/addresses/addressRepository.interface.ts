import type { AddressInput, AddressView } from '../../models/addresses/address.model.js';
export interface AddressRepository {
  create(ownerId: string, input: AddressInput): Promise<AddressView>;
  get(ownerId: string, id: string): Promise<AddressView | null>;
  list(ownerId: string, offset: number, limit: number): Promise<AddressView[]>;
  update(ownerId: string, id: string, input: AddressInput): Promise<AddressView | null>;
  delete(ownerId: string, id: string): Promise<boolean>;
}
