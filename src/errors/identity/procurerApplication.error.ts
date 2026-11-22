import { AppError } from '../app.error.js';
import { AUTH_ERROR_MESSAGES, AUTH_HTTP_STATUS } from '../../constants/auths/auth.constants.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';

export function applicationConflictError(): AppError {
  return new AppError(ErrorCode.APPLICATION_CONFLICT, AUTH_HTTP_STATUS.conflict, AUTH_ERROR_MESSAGES.applicationConflict);
}

export function applicationUnavailableError(): AppError {
  return new AppError(ErrorCode.APPLICATION_UNAVAILABLE, AUTH_HTTP_STATUS.conflict, AUTH_ERROR_MESSAGES.applicationNotAvailable);
}

export function applicationOtpInvalidError(): AppError {
  return new AppError(ErrorCode.UNAUTHORIZED, AUTH_HTTP_STATUS.unauthorized, AUTH_ERROR_MESSAGES.invalidOtp);
}

export function invitationInvalidError(): AppError {
  return new AppError(ErrorCode.INVITATION_INVALID, AUTH_HTTP_STATUS.unauthorized, AUTH_ERROR_MESSAGES.inviteInvalid);
}

export function invitationEmailMismatchError(): AppError {
  return new AppError(ErrorCode.FORBIDDEN, AUTH_HTTP_STATUS.forbidden, AUTH_ERROR_MESSAGES.inviteEmailMismatch);
}

export function invalidApplicationInputError(message: string = AUTH_ERROR_MESSAGES.applicationInputInvalid): AppError {
  return new AppError(ErrorCode.VALIDATION, AUTH_HTTP_STATUS.badRequest, message);
}

export function reviewReasonRequiredError(): AppError {
  return invalidApplicationInputError(AUTH_ERROR_MESSAGES.reasonRequired);
}

export function identityEvidenceRequiredError(): AppError {
  return invalidApplicationInputError(AUTH_ERROR_MESSAGES.identityEvidenceRequired);
}
