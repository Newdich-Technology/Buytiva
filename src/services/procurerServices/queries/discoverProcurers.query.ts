import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { DiscoveryInput } from '../../../models/procurerServices/procurerServices.model.js';
import { normalizeLocation } from '../../../validators/procurerServices/procurerServices.validator.js';
import { invalidInputError } from '../../../errors/auths/auth.error.js';
export function discoverProcurersQuery(repo: ProcurerServicesRepository, input: DiscoveryInput) {
  const country = input.country.trim().toUpperCase();
  if (!/^[A-Z]{2}$/.test(country)) throw invalidInputError('Invalid location.');
  return repo.discover({ ...input, country, region: normalizeLocation(input.region), city: normalizeLocation(input.city), area: normalizeLocation(input.area) });
}
