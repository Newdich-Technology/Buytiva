import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { ProfileInput } from '../../../models/procurerServices/procurerServices.model.js';
import { validateProfile } from '../../../validators/procurerServices/procurerServices.validator.js';
import { permissionDeniedError } from '../../../errors/auths/auth.error.js';
export async function updateOwnProfileCommand(repo: ProcurerServicesRepository, userId: string, input: ProfileInput) {
  const profile = await repo.updateOwn(userId, validateProfile(input));
  if (!profile) throw permissionDeniedError();
  return profile;
}
