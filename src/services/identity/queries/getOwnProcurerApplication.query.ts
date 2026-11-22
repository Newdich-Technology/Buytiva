import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function getOwnProcurerApplicationQuery(dependencies: AuthDependencies, userId: string) {
  return dependencies.identityRepository.getOwnApplication(userId);
}
