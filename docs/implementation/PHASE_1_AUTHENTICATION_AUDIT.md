# Phase 1 identity audit

Registration, email challenge, sessions, reset, TOTP, application review, invitations, and staff administration are implemented but only partially verified. See `docs/security/authenticationReadiness.md` and the [master checklist](PHASE_0_TO_2_MASTER_CHECKLIST.md). Authentication middleware reloads session, user state and permissions for protected calls, requires verified active users and enforces MFA for privileged roles. Local tests cannot substitute for live PostgreSQL tests, and production SMTP delivery is unverified.

Review actions previously required MFA but not *recent* MFA. This change adds the existing recent-MFA guard to identity checks and application decisions, and a PostgreSQL regression checks stale-session denial and persisted non-mutation. The regression passed on disposable PostgreSQL in CI 45665163104; no local PostgreSQL was available. Remaining work includes the full permission/revocation matrix, invitations lifecycle, recovery and bootstrap scenarios, multi-role behavior, and operational lockout handling. There is no evidence that the complete requested security suite has passed.

CI 45740462338 covers concurrent customer challenge issuance, password reset consumption, and device/session HTTP cases; see `docs/security/authenticationReadiness.md` for findings, exact evidence and remaining limitations. Authentication remains incomplete.

CI 45743359869 verifies stale MFA challenge and credential issuance fencing for the exercised cases. Authentication remains incomplete; multi-role reactivation, MFA recovery, invitation lifecycle and operational checks remain open.

Staff reactivation now exists for suspended profiles, guarded by recent Super Admin MFA and transactional revocation of existing sessions/challenges; see `docs/security/authenticationReadiness.md` and CI 45744475807. Revoked accounts are not restored through this endpoint. MFA recovery, lifecycle interleavings and production delivery/infrastructure evidence remain open.
