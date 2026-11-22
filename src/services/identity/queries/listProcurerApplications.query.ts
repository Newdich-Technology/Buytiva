import type { AuthDependencies } from '../../../types/authDependencies.type.js';

export async function listProcurerApplicationsQuery(dependencies: AuthDependencies, status?: string) {
  return dependencies.identityRepository.listApplications(status);
}

export async function getProcurerApplicationQuery(dependencies: AuthDependencies, applicationId: string) {
  return dependencies.identityRepository.getApplication(applicationId);
}

