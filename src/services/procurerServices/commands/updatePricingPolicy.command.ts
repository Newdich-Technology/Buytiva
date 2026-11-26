import type { ProcurerServicesRepository } from '../../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { PricingPolicyInput } from '../../../models/procurerServices/procurerServices.model.js';
import { validatePricing } from '../../../validators/procurerServices/procurerServices.validator.js';
export function updatePricingPolicyCommand(repo: ProcurerServicesRepository, userId: string, input: PricingPolicyInput) {
  return repo.updatePricing(userId, validatePricing(input));
}
