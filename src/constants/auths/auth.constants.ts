export const AUTH_TOKEN_ISSUER = 'buytiva-api';
export const AUTH_ACCESS_TOKEN_MINUTES = 12;
export const AUTH_REFRESH_TOKEN_DAYS = 14;
export const AUTH_OTP_LENGTH = 6;
export const AUTH_OTP_EXPIRY_MINUTES = 10;
export const AUTH_OTP_RESEND_SECONDS = 60;
export const AUTH_OTP_MAX_ATTEMPTS = 5;
export const AUTH_OTP_DAILY_LIMIT = 10;
export const AUTH_OTP_DAILY_WINDOW_HOURS = 24;
export const AUTH_LOGIN_CHALLENGE_MINUTES = 5;
export const AUTH_PASSWORD_RESET_MINUTES = 30;
export const AUTH_INVITATION_HOURS = 24;
export const AUTH_RECENT_MFA_MINUTES = 10;
export const AUTH_PASSWORD_MIN_LENGTH = 12;
export const AUTH_PASSWORD_MAX_LENGTH = 128;
export const AUTH_SESSION_MAX_DEVICES = 12;
export const AUTH_MINUTE_MS = 60_000;
export const AUTH_HOUR_MS = 3_600_000;
export const AUTH_SECOND_MS = 1_000;
export const AUTH_DAY_MS = 86_400_000;
export const AUTH_ARGON_MEMORY_KIB = 19_456;
export const AUTH_ARGON_TIME_COST = 2;
export const AUTH_ARGON_PARALLELISM = 1;
export const AUTH_COMMON_PASSWORDS = ['passwordpassword', '123456789012', 'qwertyuiop12'] as const;
export const AUTH_DEFAULT_PUBLIC_URL = 'http://localhost:5173';
export const AUTH_PASSWORD_RESET_PATH = '/forgotPassword';
export const AUTH_DEFAULT_SMTP_PORT = 587;
export const AUTH_DUMMY_PASSWORD_VALUE = 'buytiva-auth-dummy-password';
export const AUTH_TOTP_ISSUER = 'BUYTIVA';
export const AUTH_TOTP_PERIOD_SECONDS = 30;
export const AUTH_TOTP_DIGITS = 6;
export const AUTH_TOTP_WINDOW = 1;
export const AUTH_OUTBOX_MAX_ATTEMPTS = 8;
export const AUTH_OUTBOX_RETRY_BASE_MS = 60_000;
export const AUTH_OUTBOX_RETRY_MAX_MS = 3_600_000;
export const AUTH_OUTBOX_POLL_MS = 2_000;
// Expired claims can be reclaimed; delivery may have succeeded before the worker died.
export const AUTH_OUTBOX_LEASE_MS = 5 * AUTH_MINUTE_MS;
export const AUTH_EMAIL_OUTBOX_TYPES = [
  'AUTH_EMAIL_VERIFICATION',
  'AUTH_PASSWORD_RESET',
  'AUTH_APPLICATION_STATUS',
  'AUTH_INVITATION',
  'AUTH_SECURITY_ALERT'
] as const;
export const AUTH_AUDIT_ACTIONS = {
  emailVerified: 'AUTH_EMAIL_VERIFIED',
  passwordChanged: 'AUTH_PASSWORD_CHANGED',
  passwordReset: 'AUTH_PASSWORD_RESET',
  mfaEnabled: 'AUTH_MFA_ENABLED',
  applicationEmailVerified: 'PROCURER_APPLICATION_EMAIL_VERIFIED',
  procurerInvitationAccepted: 'PROCURER_INVITATION_ACCEPTED'
} as const;
export const AUTH_APPLICATION_REFERENCE_PREFIX = 'BT-P-';
export const AUTH_APPLICATION_CATEGORIES_MAX = 12;
export const AUTH_APPLICATION_EXPERIENCE_MAX = 1000;
export const AUTH_APPLICATION_NAME_MAX = 80;
export const AUTH_APPLICATION_PHONE_MAX = 32;
export const AUTH_APPLICATION_LOOKUP_MESSAGE = 'If the application is eligible, a status verification message will be sent.';
export const AUTH_BOOTSTRAP_SUPER_ADMIN_DISPLAY_NAME = 'BUYTIVA Super Administrator';
export const AUTH_BOOTSTRAP_MESSAGES = {
  missingCredentials: 'Bootstrap super administrator credentials are required.',
  ambiguousExistingAccount: 'The configured bootstrap email already belongs to an account requiring operator review.',
  existingSuperAdministrator: 'A super administrator already exists. Use an authorized invitation instead.',
  alreadyCreated: 'The pending bootstrap super administrator already exists. No changes were made.',
  created: 'Bootstrap super administrator created. Verify the email, change the temporary password, and enroll TOTP before staff access.',
  failed: 'Bootstrap did not complete. Check environment configuration and account state. No credentials were logged.'
} as const;
export const AUTH_REVIEW_REASON_MIN = 8;
export const AUTH_REVIEW_REASON_MAX = 1000;
export const AUTH_SESSION_REVOKE_REASONS = {
  user: 'USER_LOGOUT',
  userAll: 'USER_LOGOUT_ALL',
  passwordChanged: 'PASSWORD_CHANGED',
  passwordReset: 'PASSWORD_RESET',
  mfaDisabled: 'MFA_DISABLED',
  refreshReuse: 'REFRESH_TOKEN_REUSE',
  userRevoked: 'USER_REVOKED_SESSION'
} as const;
export const AUTH_SECURITY_EVENT_CODES = {
  invalidMailPayload: 'MAIL_PAYLOAD_INVALID',
  invalidMailContent: 'MAIL_CONTENT_INVALID',
  emailProviderFailure: 'EMAIL_PROVIDER_ERROR',
  outboxDeliveryFailure: 'EMAIL_DELIVERY_FAILED'
} as const;
export const AUTH_GLOBAL_RATE_LIMIT_PER_MINUTE = 120;
export const AUTH_LOGIN_RATE_LIMIT_PER_MINUTE = 8;
export const AUTH_OTP_RATE_LIMIT_PER_MINUTE = 4;
export const AUTH_RATE_WINDOW_MS = 60_000;
export const AUTH_HTTP_STATUS = {
  badRequest: 400,
  unauthorized: 401,
  forbidden: 403,
  conflict: 409,
  tooManyRequests: 429,
  internalServerError: 500
} as const;
export const AUTH_ERROR_MESSAGES = {
  invalidCredentials: 'Email or password is incorrect.',
  invalidChallenge: 'The verification challenge is invalid or expired.',
  authenticationRequired: 'Authentication is required.',
  permissionDenied: 'You are not allowed to perform this action.',
  invalidInput: 'The submitted information is invalid.',
  passwordLength: 'Password length does not meet the configured policy.',
  weakPassword: 'Choose a stronger password that is not commonly used.',
  invalidMailPayload: 'The queued email payload is invalid.',
  invalidMailContent: 'The queued email content is incomplete.',
  passwordPolicy: 'Choose a stronger password that meets the password policy.',
  passwordConfirmationMismatch: 'The password confirmation does not match.',
  passwordChangeMismatch: 'Choose a new password and confirm it correctly.',
  invalidRegistration: 'Registration details are invalid.',
  accountUnavailable: 'This account is unavailable.',
  verifyEmailBeforeSignIn: 'Verify your email before signing in.',
  privilegedMfaRequired: 'Privileged accounts must keep an authenticator enabled.',
  authenticatorAlreadyEnabled: 'An authenticator is already enabled for this account.',
  applicationConflict: 'An application is already open for this email address.',
  applicationNotAvailable: 'The application is unavailable or has changed status.',
  invalidOtp: 'The verification code is invalid or expired.',
  inviteInvalid: 'The invitation is invalid, expired, or already used.',
  inviteEmailMismatch: 'Sign in with the email address that received this invitation.',
  reasonRequired: 'A review reason is required.',
  applicationInputInvalid: 'Application details or consent are invalid.',
  verifiedEmailRequired: 'Use the verified email address on your signed-in account.',
  identityEvidenceRequired: 'A verifiable identity and compliance evidence reference is required.',
  staffPermissionInvalid: 'The selected staff permission is not allowed.',
  staffInvitationInvalid: 'The staff invitation details are invalid.',
  staffAccessChanged: 'The staff access could not be changed.',
  superAdminLastActive: 'At least one active super administrator must remain.',
  concurrentEmailVerification: 'Email verification could not be completed because account state changed.',
  invalidEncryptedSecret: 'Encrypted secret format is invalid.',
  invalidAuthenticationConfiguration: 'Authentication configuration is invalid.',
  missingConfiguration: 'A required application setting is missing.',
  invalidMailConfiguration: 'Email delivery configuration is invalid.',
  rateLimited: 'Too many requests. Try again later.'
} as const;
export const AUTH_OPENAPI_TITLE = 'BUYTIVA Authentication API';
export const AUTH_OPENAPI_VERSION = '1.0.0';
