export interface ShoppingRequestInput { listId: string; addressId: string; procurerId: string }
export interface RequestAddressSnapshot { label: string; line1: string; line2: string | null; country: string; region: string; city: string; area: string }
export interface RequestItemSnapshot { id: string; name: string; quantity: string; expectedUnitPriceMinor: string; notes: string | null }
export interface RequestListSnapshot { title: string; currency: string; notes: string | null; items: RequestItemSnapshot[] }
export interface ShoppingRequestView {
  id: string; customerId: string; procurerId: string; shoppingListId: string; status: 'REQUESTED' | 'CANCELLED';
  address: RequestAddressSnapshot; list: RequestListSnapshot; createdAt: string; updatedAt: string;
}
