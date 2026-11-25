/** Monetary amounts are decimal strings in the smallest currency unit, never floats. */
export interface PricingLine {
  readonly currency: string;
  readonly unitPriceMinor: string;
  /** Positive decimal quantity with up to three fractional digits. */
  readonly quantity: string;
}

export interface PricingPolicy {
  readonly version: string;
  readonly currency: string;
  readonly fixedFeeMinor: string;
  readonly thresholdMinor: string;
  /** Percentage of the whole subtotal above the threshold, in basis points. */
  readonly percentageBasisPoints: number;
  /** Share of the service fee retained by Newdich, in basis points. */
  readonly commissionBasisPoints: number;
  readonly deliveryFeeMinor: string;
}

export interface PricingSnapshot {
  readonly policy: Readonly<PricingPolicy>;
  readonly lines: readonly Readonly<PricingLine & { subtotalMinor: string }>[];
  readonly subtotalMinor: string;
  readonly serviceFeeMinor: string;
  readonly deliveryFeeMinor: string;
  readonly customerTotalMinor: string;
  readonly platformCommissionMinor: string;
  readonly procurerServiceEarningsMinor: string;
}
