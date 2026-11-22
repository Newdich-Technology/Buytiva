import { AppError } from '../app.error.js';
import { AUTH_HTTP_STATUS, AUTH_BOOTSTRAP_MESSAGES } from '../../constants/auths/auth.constants.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';

export function bootstrapConfigurationError(): AppError {
  return new AppError(ErrorCode.VALIDATION, AUTH_HTTP_STATUS.badRequest, AUTH_BOOTSTRAP_MESSAGES.missingCredentials);
}

export function bootstrapConflictError(existingSuperAdmin: boolean): AppError {
  const message = existingSuperAdmin ? AUTH_BOOTSTRAP_MESSAGES.existingSuperAdministrator : AUTH_BOOTSTRAP_MESSAGES.ambiguousExistingAccount;
  return new AppError(ErrorCode.CONFLICT, AUTH_HTTP_STATUS.conflict, message);
}
