# Authentication readiness and security audit

This is an incremental audit, not production certification. No `AGENTS.md` was present in the checkout. CI provisions disposable PostgreSQL and runs `pnpm test --no-file-parallelism`; production SMTP, external ingress, deployment secrets, and client storage were not exercised.

## Capability matrix

| Capability | Implementation and registered API | Executable coverage | Status |
| --- | --- | --- | --- |
| Customer registration | `src/routes/auths/auth.route.ts`, `src/services/auths/commands/registerUser.command.ts` | `tests/integration/auths/registerUser.test.ts`: registration, email verification, duplicate response | Partial verification; delivery via real SMTP not verified |
| Email OTP | `verifyEmailOtp.command.ts`, `authChallenge.repository.ts` | registration integration; `tests/unit/auths/emailOtp.test.ts`; `tests/integration/auths/attemptConcurrency.test.ts` | Partial; resend/expiry and abuse cases need more HTTP/DB tests |
| Customer login and sessions | `auth.route.ts`, `session.route.ts`, `authSession.repository.ts` | registration integration covers login, refresh replay, logout, password reset | Partial; concurrent refresh replay and expiry are exercised by `tests/integration/security/sessionConcurrency.test.ts`; logout-all and per-device HTTP coverage need more tests |
| Procurer applications | `src/routes/identity/procurerApplication.route.ts` | `tests/integration/identity/procurerApplication.test.ts`: verification, lookup, review, invitation and MFA setup | Partial; rejection, more-info, expiry/revocation and state races need tests |
| Privileged MFA | `mfa.route.ts`, `authCredential.repository.ts`, `authChallenge.repository.ts` | `tests/integration/auths/loginUser.test.ts`; `tests/integration/security/mfaReplay.test.ts` | Partial; recovery and operational lockout remain undefined |
| Super Admin and permissions | `src/routes/administrators/staff.route.ts`, `staffInvitation.repository.ts` | identity integration checks admin denial, invitations and last-admin protection; `tests/integration/security/staffConcurrency.test.ts` | Partial; bootstrap and simultaneous permission changes need independent tests |
| Outbox | `src/jobs/workers/processAuthEmailOutbox.job.ts`, `src/repositories/outbox/outbox.repository.ts` | `tests/integration/outbox/emailOutbox.test.ts`: fake-provider retries, lease races, fencing and payload clearing | Partial; SMTP delivery and operational recovery not production-verified |

## Findings and remediation

- **TOTP replay:** two distinct login challenges could accept the same or older verified TOTP time step because `completeLoginChallenge` compared the prior database value without requiring a newer step. The factor update now requires a strictly newer step and challenge consumption shares its transaction; failed challenge consumption rolls the factor update back. `tests/integration/security/mfaReplay.test.ts` checks replay, concurrent challenges and rollback.
- **Application OTP retry race:** multiple wrong requests reading the same counter could increment it only once. Both application verification and status lookup now increment atomically up to the stored limit. `tests/integration/auths/attemptConcurrency.test.ts` exercises both with a lower per-challenge limit.
- **Last Super Admin write skew:** separate transactions could each observe two active Super Admins and suspend both. Staff access changes now use serializable transactions and fail closed on serialization conflict. `tests/integration/security/staffConcurrency.test.ts` races two suspensions. Caller must retry a conflict intentionally; no automatic privileged retry is performed.
- **Suspended/unverified refresh:** refreshing after account suspension could return fresh credentials despite middleware rejecting their use. Refresh now rejects and revokes the session. `tests/integration/auths/registerUser.test.ts` and `tests/unit/auths/refreshAccountStatus.test.ts` cover the change.
- **Invalid production configuration:** production could fall back to localhost or accept HTTP as the public app origin; a non-integer maximum password length was also accepted. `src/configs/auth.config.ts` now requires an explicit HTTPS production origin and integer bounds. `tests/unit/auths/authConfig.test.ts` covers these cases.

- **Abandoned email claim:** a worker crash left `PROCESSING` records permanently stranded. Claims older than five minutes can now be reclaimed with a new fencing token; abandoned claims at the retry limit become `FAILED`. Tests exercise simultaneous recovery and reject stale worker completion/failure. SMTP is configured to require TLS and applies connection, greeting and socket timeouts. This is at-least-once delivery, not exactly-once: SMTP may have accepted a message before a timeout, crash or lease expiry. Operators must monitor failed/old claims and establish reconciliation and retention policies.

## Open security and operational gaps

- Authentication is **not complete**: the full requested red-team matrix, bootstrap behavior, invitation revocation and expiration, concurrent refresh, OTP resend, MFA recovery, and all role transitions lack sufficient independent HTTP/PostgreSQL assertions.
- Several existing integration suites delete global tables and require `--no-file-parallelism`; they are not isolated or safe to run against shared databases. Always supply a disposable `AUTH_TEST_DATABASE_URL`. No production database was touched.
- SMTP outcomes remain ambiguous after acceptance followed by a timeout or crash. Lease expiry can also overlap a slow sender; claim fencing protects database state but cannot retract an email. Retries may cause duplicates. Provider idempotency/reconciliation, production monitoring and real SMTP delivery tests are needed. Never log decrypted outbox payloads or credentials.
- Validate email delivery, TLS, host/CORS/cookie/CSRF configuration, secrets, abuse monitoring, logs, backup and recovery against the actual deployment. Email links contain one-time tokens; confirm proxy and browser logging/referrer protections.
- Production schema changes require a reviewed migration and recovery strategy; `db:sync` is only used on a disposable CI database. Do not use it against production.
- Existing rate limits are IP-based and need ingress/proxy configuration and distributed abuse testing. Customer and procurer MFA enrollment, missing role reactivation/recovery controls, and sensitive permission operations need further security review.
