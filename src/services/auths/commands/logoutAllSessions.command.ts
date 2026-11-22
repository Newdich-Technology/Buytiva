import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function logoutAllSessionsCommand(dependencies: AuthDependencies, userId: string) {
  const revokedCount = await dependencies.repository.revokeAllSessions(userId, 'USER_LOGOUT_ALL', new Date());
  return { loggedOut: true as const, revokedCount };
}
