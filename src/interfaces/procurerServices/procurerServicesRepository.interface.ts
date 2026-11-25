import type { ProfileInput, ProfileView, ZoneInput, ZoneView, DiscoveryInput, PublicProcurerView } from '../../models/procurerServices/procurerServices.model.js';
export interface ProcurerServicesRepository {
  getOwn(userId: string): Promise<ProfileView | null>;
  updateOwn(userId: string, input: ProfileInput): Promise<ProfileView | null>;
  createZone(userId: string, input: ZoneInput): Promise<ZoneView | null>;
  updateZone(userId: string, zoneId: string, input: ZoneInput): Promise<ZoneView | null>;
  discover(input: DiscoveryInput): Promise<PublicProcurerView[]>;
}
