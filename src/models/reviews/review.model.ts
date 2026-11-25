export interface ReviewInput { rating: number; comment: string | null }
export interface ReviewView { id: string; orderId: string; rating: number; comment: string | null; createdAt: string; updatedAt: string }
export type ReviewModerationStatus = 'PENDING' | 'APPROVED' | 'HIDDEN';
export interface ModerationView extends ReviewView { moderationStatus: ReviewModerationStatus }
export interface ReviewDecision { expectedStatus: ReviewModerationStatus; targetStatus: 'APPROVED' | 'HIDDEN'; reason: string }
export interface RatingSummary { averageRating: number | null; reviewCount: number; distribution: { one: number; two: number; three: number; four: number; five: number } }
