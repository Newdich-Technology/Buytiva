export type StaffInvitationRole = 'ADMIN' | 'SUPER_ADMIN';

export interface StaffInvitationRepository {
  issueStaffInvitation(input: { id: string; role: StaffInvitationRole; email: string; emailNormalized: string; displayName: string; tokenHash: string; permissionCodes: readonly string[]; issuerId: string; reason: string; expiresAt: Date; outbox: { id: string; payload: string; dedupeKey: string } }): Promise<void>;
  previewStaffInvitation(tokenHash: string, now: Date): Promise<{ email: string; displayName: string; role: StaffInvitationRole; permissionCodes: string[] } | null>;
  acceptStaffInvitation(input: { tokenHash: string; userId: string | null; email: string | null; displayName: string | null; passwordHash: string | null; confirmationOutbox: { id: string; payload: string; dedupeKey: string }; now: Date }): Promise<boolean>;
  updateStaffPermissions(input: { userId: string; actorId: string; permissionCodes: readonly string[]; reason: string; now: Date }): Promise<boolean>;
  suspendStaff(input: { userId: string; actorId: string; reason: string; now: Date }): Promise<boolean>;
  revokeStaff(input: { userId: string; actorId: string; reason: string; now: Date }): Promise<boolean>;
  listStaff(): Promise<{ id: string; email: string; displayName: string | null; roles: string[]; status: string; permissions: string[] }[]>;
  listAuditLogs(): Promise<{ action: string; resourceType: string; resourceId: string | null; actorId: string | null; createdAt: string }[]>;
}
