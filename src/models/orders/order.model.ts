export type OrderStatus = 'AWAITING_PAYMENT' | 'IN_PROGRESS' | 'DELIVERY_REPORTED' | 'COMPLETED' | 'DISPUTED' | 'CANCELLED';
export type OrderAction = 'START' | 'REPORT_DELIVERY' | 'CONFIRM_COMPLETION' | 'DISPUTE' | 'CANCEL';
export interface OrderView { id: string; quotationId: string; requestId: string; status: OrderStatus; currency: string; totalMinor: string; createdAt: string; updatedAt: string;
  history: { fromStatus: OrderStatus | null; toStatus: OrderStatus; actorId: string; createdAt: string }[] }
export interface TransitionRule { sources: OrderStatus[]; target: OrderStatus; requiresVerifiedPayment: boolean }
