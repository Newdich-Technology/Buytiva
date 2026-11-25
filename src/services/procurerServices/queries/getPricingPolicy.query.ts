import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
export function getPricingPolicyQuery(repo: ProcurerServicesRepository, userId: string) { return repo.getPricing(userId); }
