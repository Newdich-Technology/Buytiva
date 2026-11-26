export interface ReviewInput { rating: number; comment: string | null }
export interface ReviewView { id: string; orderId: string; rating: number; comment: string | null; version: number; createdAt: string; updatedAt: string }
export type ReviewModerationStatus = 'PENDING' | 'APPROVED' | 'HIDDEN';
export interface ModerationView extends ReviewView { moderationStatus: ReviewModerationStatus }
export interface ReviewDecision { expectedVersion: number; expectedStatus: ReviewModerationStatus; targetStatus: 'APPROVED' | 'HIDDEN'; reason: string }
export interface RatingSummary { averageRating: number | null; reviewCount: number; distribution: { one: number; two: number; three: number; four: number; five: number } }

export interface ReviewReportView { id: string; reviewId: string; reviewVersion: number; ratingSnapshot: number; commentSnapshot: string | null; reason: string; status: 'OPEN' | 'RESOLVED' | 'DISMISSED'; createdAt: string; updatedAt: string }
export interface ReviewReportDecision { targetStatus: 'RESOLVED' | 'DISMISSED'; reason: string }
