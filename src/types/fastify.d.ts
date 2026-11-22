import type { AuthPrincipal } from '../models/auths/auth.model.js';

declare module 'fastify' {
  interface FastifyRequest {
    authPrincipal: AuthPrincipal | null;
  }
}
