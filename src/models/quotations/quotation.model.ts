import type { PricingSnapshot } from '../pricing/pricing.model.js';
import type { RequestAddressSnapshot, RequestListSnapshot } from '../shoppingRequests/shoppingRequest.model.js';
export interface CommissionPolicy { version: string; basisPoints: number }
export interface QuotationCalculationInput { list: RequestListSnapshot; policyId: string; currency: string; fixedFeeMinor: string; thresholdMinor: string; percentageBasisPoints: number; deliveryFeeMinor: string }
export interface QuoteInput { requestId: string; expectedRevision: number; expiresAt: string }
export interface QuoteView { id: string; requestId: string; revision: number; status: 'ISSUED' | 'SUPERSEDED' | 'ACCEPTED' | 'REJECTED'; policyId: string;
  currency: string; subtotalMinor: string; serviceFeeMinor: string; deliveryFeeMinor: string; totalMinor: string; expiresAt: string; createdAt: string; decidedAt: string | null;
  address: RequestAddressSnapshot; list: RequestListSnapshot }
export type CalculateQuote = (input: QuotationCalculationInput) => PricingSnapshot;
