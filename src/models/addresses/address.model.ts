export interface AddressInput {
  label: string; line1: string; line2: string | null;
  country: string; region: string; city: string; area: string;
}
export interface AddressView extends AddressInput { id: string; createdAt: string; updatedAt: string }
