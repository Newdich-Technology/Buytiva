import type { PricingLine, PricingPolicy, PricingSnapshot } from '../../../models/pricing/pricing.model.js';

// Monetary storage is bounded to Decimal(18, 2) in major-unit equivalents.
const MAX_MINOR = 999_999_999_999_999_999n;
const MAX_QUANTITY_MILLI = 999_999_999_999n;
const BASIS_POINTS = 10_000n;

function minor(value: string, name: string): bigint {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,17})$/.test(value)) throw new RangeError(`Invalid ${name}`);
  return BigInt(value);
}

function quantity(value: string): bigint {
  if (typeof value !== 'string' || !/^(0|[1-9]\d{0,8})(\.\d{1,3})?$/.test(value)) throw new RangeError('Invalid quantity');
  const [whole, fraction = ''] = value.split('.');
  const result = BigInt(whole!) * 1000n + BigInt(fraction.padEnd(3, '0'));
  if (result <= 0n || result > MAX_QUANTITY_MILLI) throw new RangeError('Invalid quantity');
  return result;
}

function rate(value: number, name: string): bigint {
  if (!Number.isInteger(value) || value < 0 || value > 10_000) throw new RangeError(`Invalid ${name}`);
  return BigInt(value);
}

function checked(value: bigint): bigint {
  if (value > MAX_MINOR) throw new RangeError('Amount exceeds supported range');
  return value;
}

function rounded(numerator: bigint, denominator: bigint): bigint {
  return (numerator + denominator / 2n) / denominator;
}

/**
 * Explicit policy: fixed fee at or below threshold; percentage of the entire
 * subtotal above it. Every line and percentage is rounded half-up to a minor unit.
 * This is a calculation only: callers must persist an immutable policy snapshot
 * and confirm the business rule before using the result for a quote or payment.
 */
export function calculatePricingQuery(lines: readonly PricingLine[], policy: PricingPolicy): PricingSnapshot {
  if (!policy || typeof policy.version !== 'string' || !policy.version.trim() || policy.version.length > 100) throw new RangeError('Invalid policy version');
  if (!/^[A-Z]{3}$/.test(policy.currency)) throw new RangeError('Invalid currency');
  if (!Array.isArray(lines) || lines.length === 0 || lines.length > 1000) throw new RangeError('Invalid items');
  const fixed = minor(policy.fixedFeeMinor, 'fixed fee');
  const threshold = minor(policy.thresholdMinor, 'threshold');
  const delivery = minor(policy.deliveryFeeMinor, 'delivery fee');
  const percentage = rate(policy.percentageBasisPoints, 'percentage');
  const commissionRate = rate(policy.commissionBasisPoints, 'commission');
  let subtotal = 0n;
  const calculatedLines = lines.map((line) => {
    if (!line || line.currency !== policy.currency) throw new RangeError('Currency mismatch');
    const amount = checked(rounded(minor(line.unitPriceMinor, 'unit price') * quantity(line.quantity), 1000n));
    subtotal = checked(subtotal + amount);
    return Object.freeze({ currency: line.currency, unitPriceMinor: line.unitPriceMinor, quantity: line.quantity, subtotalMinor: amount.toString() });
  });
  const service = checked(subtotal <= threshold ? fixed : rounded(subtotal * percentage, BASIS_POINTS));
  const commission = checked(rounded(service * commissionRate, BASIS_POINTS));
  const total = checked(subtotal + service + delivery);
  return Object.freeze({
    policy: Object.freeze({ ...policy }), lines: Object.freeze(calculatedLines), subtotalMinor: subtotal.toString(),
    serviceFeeMinor: service.toString(), deliveryFeeMinor: delivery.toString(), customerTotalMinor: total.toString(),
    platformCommissionMinor: commission.toString(), procurerServiceEarningsMinor: (service - commission).toString()
  });
}
