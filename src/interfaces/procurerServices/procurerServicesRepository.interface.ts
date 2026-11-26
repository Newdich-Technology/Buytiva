import type { ProfileInput, ProfileView, ZoneInput, ZoneView, DiscoveryInput, PublicProcurerView, PricingPolicyInput, PricingPolicyView } from '../../models/procurerServices/procurerServices.model.js';
export interface ProcurerServicesRepository {
  getOwn(userId: string): Promise<ProfileView | null>;
  updateOwn(userId: string, input: ProfileInput): Promise<ProfileView | null>;
  createZone(userId: string, input: ZoneInput): Promise<ZoneView | null>;
  updateZone(userId: string, zoneId: string, input: ZoneInput): Promise<ZoneView | null>;
  findPricingForLocation(userId: string, location: Pick<DiscoveryInput, 'country' | 'region' | 'city' | 'area'>): Promise<{ zone: ZoneView; pricing: PricingPolicyView } | null>;
  getPricing(userId: string): Promise<PricingPolicyView | null>;
  updatePricing(userId: string, input: PricingPolicyInput): Promise<PricingPolicyView>;
  discover(input: DiscoveryInput): Promise<PublicProcurerView[]>;
}
