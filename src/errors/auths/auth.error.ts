import { AppError } from '../app.error.js';
import { ErrorCode } from '../../enums/errorCode.enum.js';
import { AUTH_ERROR_MESSAGES, AUTH_HTTP_STATUS } from '../../constants/auths/auth.constants.js';

export function invalidCredentialsError(): AppError {
  return new AppError(ErrorCode.UNAUTHORIZED, AUTH_HTTP_STATUS.unauthorized, AUTH_ERROR_MESSAGES.invalidCredentials);
}

export function invalidChallengeError(): AppError {
  return new AppError(ErrorCode.UNAUTHORIZED, AUTH_HTTP_STATUS.unauthorized, AUTH_ERROR_MESSAGES.invalidChallenge);
}

export function authenticationRequiredError(): AppError {
  return new AppError(ErrorCode.UNAUTHORIZED, AUTH_HTTP_STATUS.unauthorized, AUTH_ERROR_MESSAGES.authenticationRequired);
}

export function permissionDeniedError(): AppError {
  return new AppError(ErrorCode.FORBIDDEN, AUTH_HTTP_STATUS.forbidden, AUTH_ERROR_MESSAGES.permissionDenied);
}

export function accountStateError(code: ErrorCode, message: string): AppError {
  return new AppError(code, AUTH_HTTP_STATUS.forbidden, message);
}

export function conflictError(message: string): AppError {
  return new AppError(ErrorCode.CONFLICT, AUTH_HTTP_STATUS.conflict, message);
}

export function invalidInputError(message: string): AppError {
  return new AppError(ErrorCode.VALIDATION, AUTH_HTTP_STATUS.badRequest, message);
}

export function invalidPasswordLengthError(): AppError {
  return invalidInputError(AUTH_ERROR_MESSAGES.passwordLength);
}

export function weakPasswordError(): AppError {
  return invalidInputError(AUTH_ERROR_MESSAGES.weakPassword);
}

export function passwordPolicyError(): AppError {
  return invalidInputError(AUTH_ERROR_MESSAGES.passwordPolicy);
}

export function invalidRegistrationError(): AppError {
  return invalidInputError(AUTH_ERROR_MESSAGES.invalidRegistration);
}

export function invalidEncryptedSecretError(): AppError {
  return invalidInputError(AUTH_ERROR_MESSAGES.invalidEncryptedSecret);
}

export function authenticationConfigurationError(): AppError {
  return new AppError(ErrorCode.INTERNAL, AUTH_HTTP_STATUS.internalServerError, AUTH_ERROR_MESSAGES.invalidAuthenticationConfiguration);
}

export function missingConfigurationError(): AppError {
  return new AppError(ErrorCode.INTERNAL, AUTH_HTTP_STATUS.internalServerError, AUTH_ERROR_MESSAGES.missingConfiguration);
}

export function mailConfigurationError(): AppError {
  return new AppError(ErrorCode.INTERNAL, AUTH_HTTP_STATUS.internalServerError, AUTH_ERROR_MESSAGES.invalidMailConfiguration);
}

export function concurrentEmailVerificationError(): AppError {
  return conflictError(AUTH_ERROR_MESSAGES.concurrentEmailVerification);
}

export function accountUnavailableError(): AppError {
  return accountStateError(ErrorCode.ACCOUNT_SUSPENDED, AUTH_ERROR_MESSAGES.accountUnavailable);
}

export function emailNotVerifiedError(): AppError {
  return accountStateError(ErrorCode.EMAIL_NOT_VERIFIED, AUTH_ERROR_MESSAGES.verifyEmailBeforeSignIn);
}

export function privilegedMfaRequiredError(): AppError {
  return accountStateError(ErrorCode.MFA_REQUIRED, AUTH_ERROR_MESSAGES.privilegedMfaRequired);
}

export function authenticatorAlreadyEnabledError(): AppError {
  return conflictError(AUTH_ERROR_MESSAGES.authenticatorAlreadyEnabled);
}

export function staffAccessConflictError(message: string = AUTH_ERROR_MESSAGES.staffAccessChanged): AppError {
  return conflictError(message);
}

