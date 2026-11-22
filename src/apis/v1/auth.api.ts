import type { FastifyPluginAsync } from 'fastify';
import type { AuthDependencies } from '../../types/authDependencies.type.js';
import { authRoute } from '../../routes/auths/auth.route.js';
import { mfaRoute } from '../../routes/auths/mfa.route.js';
import { sessionRoute } from '../../routes/auths/session.route.js';
import { procurerApplicationRoute } from '../../routes/identity/procurerApplication.route.js';
import { staffRoute } from '../../routes/administrators/staff.route.js';

export interface AuthenticationApiOptions {
  readonly authDependencies: AuthDependencies;
}

export const registerAuthenticationApi: FastifyPluginAsync<AuthenticationApiOptions> = async (app, options) => {
  const authOptions = { authDependencies: options.authDependencies };
  await app.register(authRoute, authOptions);
  await app.register(mfaRoute, authOptions);
  await app.register(sessionRoute, authOptions);
  await app.register(procurerApplicationRoute, authOptions);
  await app.register(staffRoute, authOptions);
};
