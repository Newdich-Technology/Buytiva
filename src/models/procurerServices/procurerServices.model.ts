export interface ProfileInput { publicName: string; biography: string | null; acceptingRequests: boolean }
export interface ZoneInput { country: string; region: string; city: string; area: string; deliveryFeeMinor: string; currency: 'NGN'; active: boolean }
export interface ZoneView extends ZoneInput { id: string }
export interface ProfileView { userId: string; status: string; publicName: string | null; biography: string | null; acceptingRequests: boolean; zones: ZoneView[] }
export interface DiscoveryInput { country: string; region: string; city: string; area: string; offset: number; limit: number }
export interface PricingPolicyInput { currency: 'NGN'; fixedFeeMinor: string; thresholdMinor: string; percentageBasisPoints: number; expectedVersion: number }
export interface PricingPolicyView { id: string; version: number; currency: 'NGN'; fixedFeeMinor: string; thresholdMinor: string; percentageBasisPoints: number; createdAt: string }
export interface PublicProcurerView { userId: string; publicName: string; biography: string | null; zone: ZoneView; pricing: PricingPolicyView }
