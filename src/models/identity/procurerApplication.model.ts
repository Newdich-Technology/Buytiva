export interface ApplicationSubmission {
  readonly id: string;
  readonly publicReference: string;
  readonly email: string;
  readonly emailNormalized: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly phone: string;
  readonly proposedCountry: string;
  readonly proposedRegion: string | null;
  readonly proposedCity: string;
  readonly proposedArea: string | null;
  readonly categories: readonly string[];
  readonly experience: string | null;
  readonly linkedUserId: string | null;
  readonly consentAt: Date;
  readonly challenge: { readonly id: string; readonly digest: string; readonly expiresAt: Date; readonly resendAt: Date };
  readonly verificationEmail: { readonly id: string; readonly payload: string; readonly dedupeKey: string };
}

export interface ApplicationStatus {
  readonly id: string;
  readonly publicReference: string;
  readonly firstName: string;
  readonly lastName: string;
  readonly applicantEmail: string;
  readonly phone: string | null;
  readonly proposedCountry: string;
  readonly proposedRegion: string | null;
  readonly proposedCity: string;
  readonly proposedArea: string | null;
  readonly categories: string[];
  readonly experience: string | null;
  readonly status: string;
  readonly emailVerifiedAt: string | null;
  readonly identityVerifiedAt: string | null;
  readonly complianceVerifiedAt: string | null;
  readonly submittedAt: string;
  readonly updatedAt: string;
  readonly statusHistory: { status: string; reason: string | null; createdAt: string }[];
}
