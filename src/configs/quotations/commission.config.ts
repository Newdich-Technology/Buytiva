import type { CommissionPolicy } from '../../models/quotations/quotation.model.js';
import { AppError } from '../../errors/app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';
export function getCommissionPolicy(environment: NodeJS.ProcessEnv = process.env): CommissionPolicy {
  const version = environment.PLATFORM_COMMISSION_POLICY_VERSION?.trim();
  const rate = environment.PLATFORM_COMMISSION_BASIS_POINTS;
  if (!version || version.length > 100 || !rate || !/^(0|[1-9]\d{0,4})$/.test(rate) || Number(rate) > 10000) {
    throw new AppError(ErrorCode.INTERNAL, 503, 'Quotation commission policy is not configured.');
  }
  return { version, basisPoints: Number(rate) };
}
