import type { FastifyInstance, FastifyRequest, preHandlerAsyncHookHandler } from 'fastify';
import { AUTH_RECENT_MFA_MINUTES, AUTH_MINUTE_MS, AUTH_TOKEN_ISSUER } from '../constants/auths/auth.constants.js';
import { ErrorCode } from '../enums/errorCode.enum.js';
import { UserRole } from '../enums/userRole.enum.js';
import { authenticationRequiredError, accountStateError, permissionDeniedError } from '../errors/auths/auth.error.js';
import type { AuthDependencies } from '../types/authDependencies.type.js';
import { verifyAccessToken } from '../lib/security/tokenVerifier.js';

export function registerAuthenticationRequestContext(app: FastifyInstance): void {
  app.decorateRequest('authPrincipal', null);
}

export function createAuthenticateMiddleware(dependencies: AuthDependencies): preHandlerAsyncHookHandler {
  return async (request: FastifyRequest) => {
    const authorization = request.headers.authorization;
    if (!authorization?.startsWith('Bearer ')) throw authenticationRequiredError();
    const claims = verifyAccessToken(authorization.slice('Bearer '.length), dependencies.config.tokenSecret, AUTH_TOKEN_ISSUER);
    if (!claims) throw authenticationRequiredError();
    const principal = await dependencies.repository.getAccessPrincipal(claims.sid, claims.sub, new Date());
    if (!principal || principal.userStatus !== 'ACTIVE' || !principal.emailVerifiedAt) throw authenticationRequiredError();
    if (principal.mustChangePassword && !isPasswordChangeAllowedPath(request.url)) {
      throw accountStateError(ErrorCode.PENDING_PASSWORD_CHANGE, 'Change the temporary password before continuing.');
    }
    request.authPrincipal = principal;
  };
}

export function createOptionalAuthenticateMiddleware(dependencies: AuthDependencies): preHandlerAsyncHookHandler {
  const authenticate = createAuthenticateMiddleware(dependencies);
  return async (request, reply) => {
    if (request.headers.authorization) await authenticate.call(request.server, request, reply);
  };
}

export function requireAuthenticatedRole(role: UserRole): preHandlerAsyncHookHandler {
  return async (request: FastifyRequest) => {
    const principal = requirePrincipal(request);
    if (!principal.roles.includes(role)) throw permissionDeniedError();
    if (role === UserRole.PROCURER && principal.procurerStatus !== 'ACTIVE') {
      throw accountStateError(ErrorCode.PROCURER_PENDING_COMPLIANCE, 'Procurer access is not active.');
    }
    if ((role === UserRole.ADMIN || role === UserRole.SUPER_ADMIN) && principal.staffStatus !== 'ACTIVE') {
      throw accountStateError(ErrorCode.ACCOUNT_SUSPENDED, 'Staff access is not active.');
    }
    if (role !== UserRole.CUSTOMER && !principal.mfaAt) {
      throw accountStateError(ErrorCode.MFA_REQUIRED, 'Authenticator verification is required.');
    }
  };
}

export function requireStaffPermission(permission: string): preHandlerAsyncHookHandler {
  return async (request: FastifyRequest) => {
    const principal = requirePrincipal(request);
    const isSuperAdmin = principal.roles.includes(UserRole.SUPER_ADMIN) && principal.staffStatus === 'ACTIVE';
    const isAdmin = principal.roles.includes(UserRole.ADMIN) && principal.staffStatus === 'ACTIVE';
    if (!isSuperAdmin && (!isAdmin || !principal.permissions.includes(permission))) throw permissionDeniedError();
    if (!principal.mfaAt) throw accountStateError(ErrorCode.MFA_REQUIRED, 'Authenticator verification is required.');
  };
}

export function requireRecentMfa(request: FastifyRequest): void {
  const principal = requirePrincipal(request);
  if (!principal.mfaAt || Date.now() - principal.mfaAt.getTime() > AUTH_RECENT_MFA_MINUTES * AUTH_MINUTE_MS) {
    throw accountStateError(ErrorCode.MFA_REQUIRED, 'Recent authenticator verification is required.');
  }
}

export function getAuthenticatedPrincipal(request: FastifyRequest) {
  return requirePrincipal(request);
}

function requirePrincipal(request: FastifyRequest) {
  if (!request.authPrincipal) throw authenticationRequiredError();
  return request.authPrincipal;
}

function isPasswordChangeAllowedPath(url: string): boolean {
  return url.startsWith('/api/v1/auth/password/change') || url.startsWith('/api/v1/auth/logout');
}
