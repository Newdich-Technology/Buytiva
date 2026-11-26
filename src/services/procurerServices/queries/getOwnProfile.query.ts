import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import { permissionDeniedError } from '../../../errors/auths/auth.error.js';
export async function getOwnProfileQuery(repo: ProcurerServicesRepository, userId: string) {
  const profile = await repo.getOwn(userId);
  if (!profile) throw permissionDeniedError();
  return profile;
}
