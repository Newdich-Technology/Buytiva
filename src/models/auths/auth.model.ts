import type { UserRole } from '../../enums/userRole.enum.js';
import type { UserStatus } from '../../enums/userStatus.enum.js';

export interface AuthAccount {
  readonly id: string;
  readonly email: string;
  readonly emailNormalized: string;
  readonly displayName: string | null;
  readonly emailVerifiedAt: Date | null;
  readonly status: UserStatus;
  readonly passwordHash: string | null;
  readonly mustChangePassword: boolean;
  readonly roles: readonly UserRole[];
  readonly mfaSecret: Uint8Array | null;
  readonly lastAcceptedTimeStep: bigint | null;
  readonly staffStatus: string | null;
  readonly procurerStatus: string | null;
}

export interface EmailOtpRecord {
  readonly id: string;
  readonly emailNormalized: string;
  readonly purpose: string;
  readonly digest: string;
  readonly userId: string | null;
  readonly applicationId: string | null;
  readonly attempts: number;
  readonly maxAttempts: number;
  readonly expiresAt: Date;
  readonly consumedAt: Date | null;
  readonly supersededAt: Date | null;
}

export interface AuthPrincipal {
  readonly userId: string;
  readonly sessionId: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly roles: readonly UserRole[];
  readonly permissions: readonly string[];
  readonly emailVerifiedAt: Date | null;
  readonly userStatus: UserStatus;
  readonly mustChangePassword: boolean;
  readonly mfaAt: Date | null;
  readonly sessionExpiresAt: Date;
  readonly procurerStatus: string | null;
  readonly staffStatus: string | null;
}

export interface IssuedSession {
  readonly sessionId: string;
  readonly refreshToken: string;
  readonly refreshExpiresAt: Date;
}

export interface PublicAuthUser {
  readonly id: string;
  readonly email: string;
  readonly displayName: string | null;
  readonly roles: UserRole[];
  readonly currentRole: UserRole | null;
}

export interface AuthTokenResponse {
  readonly accessToken: string;
  readonly refreshToken: string;
  readonly accessTokenExpiresAt: string;
  readonly refreshTokenExpiresAt: string;
  readonly user: PublicAuthUser;
}
