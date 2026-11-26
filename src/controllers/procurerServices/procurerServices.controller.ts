import type { ProcurerServicesRepository } from '../../interfaces/procurerServices/procurerServicesRepository.interface.js';
import type { ProfileInput, ZoneInput, DiscoveryInput, PricingPolicyInput } from '../../models/procurerServices/procurerServices.model.js';
import { getOwnProfileQuery } from '../../services/procurerServices/queries/getOwnProfile.query.js';
import { updateOwnProfileCommand } from '../../services/procurerServices/commands/updateOwnProfile.command.js';
import { saveZoneCommand } from '../../services/procurerServices/commands/saveZone.command.js';
import { discoverProcurersQuery } from '../../services/procurerServices/queries/discoverProcurers.query.js';
import { updatePricingPolicyCommand } from '../../services/procurerServices/commands/updatePricingPolicy.command.js';
import { getPricingPolicyQuery } from '../../services/procurerServices/queries/getPricingPolicy.query.js';
export class ProcurerServicesController {
  constructor(private readonly repo: ProcurerServicesRepository) {}
  own(userId: string) { return getOwnProfileQuery(this.repo, userId); }
  update(userId: string, input: ProfileInput) { return updateOwnProfileCommand(this.repo, userId, input); }
  saveZone(userId: string, input: ZoneInput, id?: string) { return saveZoneCommand(this.repo, userId, input, id); }
  pricing(userId: string) { return getPricingPolicyQuery(this.repo, userId); }
  updatePricing(userId: string, input: PricingPolicyInput) { return updatePricingPolicyCommand(this.repo, userId, input); }
  discover(input: DiscoveryInput) { return discoverProcurersQuery(this.repo, input); }
}
