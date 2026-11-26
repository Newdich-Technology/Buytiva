import { AUTH_DEFAULT_PUBLIC_URL, AUTH_PASSWORD_MAX_LENGTH, AUTH_PASSWORD_MIN_LENGTH } from '../constants/auths/auth.constants.js';
import { authenticationConfigurationError, missingConfigurationError } from '../errors/auths/auth.error.js';

export interface AuthConfig {
  readonly tokenSecret: string;
  readonly otpPepper: string;
  readonly encryptionKey: Buffer;
  readonly publicBaseUrl: string;
  readonly secureCookies: boolean;
  readonly passwordMinLength: number;
  readonly passwordMaxLength: number;
}

export function getAuthConfig(environment: NodeJS.ProcessEnv = process.env): AuthConfig {
  const tokenSecret = requireSecret(environment.AUTH_TOKEN_SECRET, 'AUTH_TOKEN_SECRET');
  const otpPepper = requireSecret(environment.AUTH_OTP_PEPPER, 'AUTH_OTP_PEPPER');
  const encryptionKeyText = requireSecret(environment.AUTH_ENCRYPTION_KEY, 'AUTH_ENCRYPTION_KEY');
  const encryptionKey = Buffer.from(encryptionKeyText, 'base64');
  if (tokenSecret.length < 32 || otpPepper.length < 32 || encryptionKey.length !== 32) {
    throw authenticationConfigurationError();
  }
  let parsedUrl: URL;
  try {
    if (environment.NODE_ENV === 'production' && !environment.PUBLIC_APP_URL) throw authenticationConfigurationError();
    parsedUrl = new URL(environment.PUBLIC_APP_URL ?? AUTH_DEFAULT_PUBLIC_URL);
    if (!['http:', 'https:'].includes(parsedUrl.protocol) || parsedUrl.username || parsedUrl.password ||
      (environment.NODE_ENV === 'production' && parsedUrl.protocol !== 'https:')) throw authenticationConfigurationError();
  } catch {
    throw authenticationConfigurationError();
  }
  const publicBaseUrl = parsedUrl.origin;
  const passwordMinLength = Number(environment.AUTH_PASSWORD_MIN_LENGTH ?? AUTH_PASSWORD_MIN_LENGTH);
  const passwordMaxLength = Number(environment.AUTH_PASSWORD_MAX_LENGTH ?? AUTH_PASSWORD_MAX_LENGTH);
  if (!Number.isInteger(passwordMinLength) || !Number.isInteger(passwordMaxLength) || passwordMinLength < 12 || passwordMaxLength < passwordMinLength || passwordMaxLength > 256) {
    throw authenticationConfigurationError();
  }
  return {
    tokenSecret,
    otpPepper,
    encryptionKey,
    publicBaseUrl,
    secureCookies: environment.NODE_ENV === 'production',
    passwordMinLength,
    passwordMaxLength
  };
}

function requireSecret(value: string | undefined, name: string): string {
  if (!value) throw missingConfigurationError();
  return value;
}
