export interface ReviewInput { rating: number; comment: string | null }
export interface ReviewView { id: string; orderId: string; rating: number; comment: string | null; createdAt: string; updatedAt: string }
