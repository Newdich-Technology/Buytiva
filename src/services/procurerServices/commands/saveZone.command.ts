import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { ZoneInput } from '../../../models/procurerServices/procurerServices.model.js';
import { validateZone } from '../../../validators/procurerServices/procurerServices.validator.js';
import { permissionDeniedError } from '../../../errors/auths/auth.error.js';
export async function saveZoneCommand(repo: ProcurerServicesRepository, userId: string, input: ZoneInput, id?: string) {
  const validated = validateZone(input);
  const result = id ? await repo.updateZone(userId, id, validated) : await repo.createZone(userId, validated);
  if (!result) throw permissionDeniedError();
  return result;
}
