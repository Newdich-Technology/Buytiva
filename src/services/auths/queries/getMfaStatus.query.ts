import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function getMfaStatusQuery(dependencies: AuthDependencies, userId: string) {
  const factor = await dependencies.repository.getMfaFactor(userId);
  return { enabled: factor?.enabledAt !== null && factor?.enabledAt !== undefined };
}
