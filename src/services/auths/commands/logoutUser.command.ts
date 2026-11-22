import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function logoutUserCommand(dependencies: AuthDependencies, userId: string, sessionId: string) {
  await dependencies.repository.revokeSession(sessionId, userId, 'USER_LOGOUT', new Date());
  return { loggedOut: true as const };
}
