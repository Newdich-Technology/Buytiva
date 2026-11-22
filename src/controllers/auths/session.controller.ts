import type { AuthDependencies } from '../../types/authDependencies.type.js';
import type { AuthPrincipal } from '../../models/auths/auth.model.js';
import { refreshSessionCommand } from '../../services/auths/commands/refreshSession.command.js';
import { logoutUserCommand } from '../../services/auths/commands/logoutUser.command.js';
import { logoutAllSessionsCommand } from '../../services/auths/commands/logoutAllSessions.command.js';
import { listActiveSessionsQuery } from '../../services/auths/queries/listActiveSessions.query.js';

export class SessionController {
  constructor(private readonly dependencies: AuthDependencies) {}

  refresh(token: string) {
    return refreshSessionCommand(this.dependencies, token);
  }

  logout(principal: AuthPrincipal) {
    return logoutUserCommand(this.dependencies, principal.userId, principal.sessionId);
  }

  logoutAll(principal: AuthPrincipal) {
    return logoutAllSessionsCommand(this.dependencies, principal.userId);
  }

  list(principal: AuthPrincipal) {
    return listActiveSessionsQuery(this.dependencies, principal.userId);
  }

  revoke(principal: AuthPrincipal, sessionId: string) {
    return this.dependencies.repository.revokeSession(sessionId, principal.userId, 'USER_REVOKED_SESSION', new Date());
  }
}
