import { Type } from 'typebox';

export const acceptedResponse = Type.Object({ accepted: Type.Literal(true), message: Type.String() });

export const authSessionResponse = Type.Object({
  accessToken: Type.String(),
  refreshToken: Type.String(),
  accessTokenExpiresAt: Type.String({ format: 'date-time' }),
  refreshTokenExpiresAt: Type.String({ format: 'date-time' }),
  user: Type.Object({
    id: Type.String({ format: 'uuid' }),
    email: Type.String({ format: 'email' }),
    displayName: Type.Union([Type.String(), Type.Null()]),
    roles: Type.Array(Type.String()),
    currentRole: Type.Union([Type.String(), Type.Null()])
  })
});

export const loginResponse = Type.Union([
  Type.Object({ authenticationRequired: Type.Literal(false), session: authSessionResponse }),
  Type.Object({
    authenticationRequired: Type.Literal(true),
    challengeType: Type.Union([Type.Literal('LOGIN_MFA'), Type.Literal('MFA_ENROLLMENT')]),
    challengeToken: Type.String(),
    expiresInSeconds: Type.Number(),
    passwordChangeRequired: Type.Boolean()
  })
]);

export const okResponse = Type.Object({ ok: Type.Literal(true) });
