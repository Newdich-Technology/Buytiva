export interface ListInput { title: string; currency: string; notes?: string | null }
export interface ItemInput { name: string; quantity: string; expectedUnitPriceMinor: string; notes?: string | null }
export interface StoredItemInput { name: string; quantityMilli: number; expectedUnitPriceMinor: bigint; notes: string | null }
export interface ListItemView { id: string; name: string; quantity: string; expectedUnitPriceMinor: string; notes: string | null }
export interface ShoppingListView {
  id: string; title: string; currency: string; notes: string | null; status: 'DRAFT' | 'SUBMITTED';
  createdAt: string; updatedAt: string; submittedAt: string | null; items: ListItemView[];
}
