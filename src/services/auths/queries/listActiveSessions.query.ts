import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function listActiveSessionsQuery(dependencies: AuthDependencies, userId: string) {
  const sessions = await dependencies.repository.listSessions(userId, new Date());
  return sessions.map((session) => ({
    ...session,
    createdAt: session.createdAt.toISOString(),
    lastUsedAt: session.lastUsedAt?.toISOString() ?? null,
    expiresAt: session.expiresAt.toISOString()
  }));
}
