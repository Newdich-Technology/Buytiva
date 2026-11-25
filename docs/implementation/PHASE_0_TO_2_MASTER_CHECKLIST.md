# Phase 0–2 master implementation checklist

Generated from `checklist.json` by `scripts/ci/checkImplementationChecklist.py`. Evidence is scoped to each entry; partial, missing, blocked and failed entries remain unchecked. Automated existence checks do not establish functional coverage or release readiness.

| Gate | Entries | Verified | Partial | Missing | Blocked | Failed |
|---|---:|---:|---:|---:|---:|---:|
| 0 | 9 | 2 | 6 | 0 | 1 | 0 |
| 1 | 8 | 0 | 8 | 0 | 0 | 0 |
| 2A | 10 | 0 | 10 | 0 | 0 | 0 |
| 2B | 3 | 0 | 0 | 3 | 0 | 0 |
| 2C | 6 | 0 | 2 | 1 | 3 | 0 |

## [ ] Phase 0: Architecture, centralized layers and Fastify

- **Status:** partial
- **Source:** `src/app.ts`
- **API:** /api/v1
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** local tests and previous CI passed
- **Security:** Avoid duplicate layers; no handwritten SQL
- **Frontend:** Web and mobile exist
- **Remaining/limitations:** 591 empty src files; architectural and circular dependency audit incomplete

## [x] Phase 0: Health liveness

- **Status:** verified
- **Source:** `src/routes/health/health.route.ts`
- **API:** GET /api/v1/health
- **Prisma model:** `none`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** local test passed
- **Security:** No sensitive data
- **Frontend:** No dedicated consumer
- **Remaining/limitations:** Liveness is not database readiness

## [ ] Phase 0: Database schema and generator

- **Status:** partial
- **Source:** `prisma/schema.prisma`
- **API:** none
- **Prisma model:** `prisma/models/`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed db:validate and disposable PG tests
- **Security:** No destructive sync on production
- **Frontend:** not applicable
- **Remaining/limitations:** No reviewed production migration or full constraint audit

## [ ] Phase 0: Environment configuration and secrets

- **Status:** partial
- **Source:** `src/configs/auth.config.ts`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/unit/auths/authConfig.test.ts`
- **Result/evidence:** local test passed
- **Security:** Unique strong secrets; TLS and trusted origin
- **Frontend:** Web uses API_BASE_URL; mobile build define
- **Remaining/limitations:** Deployment settings and secret rotation unverified

## [ ] Phase 0: Startup, graceful shutdown and health readiness

- **Status:** partial
- **Source:** `src/server.ts`
- **API:** GET /api/v1/health
- **Prisma model:** `none`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** liveness test passed; no real startup/shutdown test
- **Security:** Fail closed on DB connection; release resources
- **Frontend:** not applicable
- **Remaining/limitations:** Failure and signal shutdown tests and readiness endpoint missing

## [ ] Phase 0: Error mapping and request validation

- **Status:** partial
- **Source:** `src/errors/errorMapper.ts`
- **API:** all registered APIs
- **Prisma model:** `none`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** local tests passed
- **Security:** Reject extra fields and avoid sensitive error logs
- **Frontend:** Error envelope normalization added in both clients
- **Remaining/limitations:** Response/error OpenAPI coverage incomplete

## [ ] Phase 0: CORS, CSRF and security headers

- **Status:** blocked
- **Source:** `src/app.ts`
- **API:** all APIs
- **Prisma model:** `none`
- **Test:** `tests/security/csrfProtection.test.ts`
- **Result/evidence:** TODO, not executed
- **Security:** Deployment-specific allowed origins and CSRF for cookies
- **Frontend:** Web BFF uses cookies
- **Remaining/limitations:** No deployed ingress/cookie/CSRF assessment or full security headers

## [ ] Phase 0: Logging, outbox and observability

- **Status:** partial
- **Source:** `src/jobs/workers/processAuthEmailOutbox.job.ts`
- **API:** none
- **Prisma model:** `prisma/models/outboxEvent.prisma`
- **Test:** `tests/integration/outbox/emailOutbox.test.ts`
- **Result/evidence:** CI 45641130413 passed with fake provider
- **Security:** No secret logs; retries may duplicate SMTP
- **Frontend:** not applicable
- **Remaining/limitations:** Production SMTP, monitoring and delivery reconciliation unverified

## [x] Phase 0: File-length enforcement

- **Status:** verified
- **Source:** `scripts/checkFileLength.ts`
- **API:** none
- **Prisma model:** `none`
- **Test:** `scripts/checkFileLength.ts`
- **Result/evidence:** local check passed
- **Security:** 250-line limit
- **Frontend:** Both platforms included by script
- **Remaining/limitations:** Does not prove business correctness

## [ ] Phase 1: Customer registration and email OTP

- **Status:** partial
- **Source:** `src/routes/auths/auth.route.ts`
- **API:** POST /api/v1/auth/register; /auth/email-otp/verify
- **Prisma model:** `prisma/models/authCredentials.prisma`
- **Test:** `tests/integration/auths/registerUser.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Hash OTP; atomic consume; rate limit
- **Frontend:** Web/mobile auth clients exist
- **Remaining/limitations:** Real SMTP, expiry/resend exhaustive HTTP cases remain

## [ ] Phase 1: Login, rotation, logout and revocation

- **Status:** partial
- **Source:** `src/routes/auths/session.route.ts`
- **API:** /api/v1/auth/login; /auth/refresh; /auth/logout
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/security/sessionConcurrency.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Replay revokes family; ownership; no token logs
- **Frontend:** Web/mobile auth clients exist
- **Remaining/limitations:** Full session expiry and device HTTP matrix incomplete

## [ ] Phase 1: Password change and recovery

- **Status:** partial
- **Source:** `src/services/auths/commands/resetPassword.command.ts`
- **API:** /api/v1/auth/password/reset; /auth/password/change
- **Prisma model:** `prisma/models/passwordReset.prisma`
- **Test:** `tests/integration/auths/registerUser.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** One-time reset; invalidate sessions
- **Frontend:** Web/mobile forms exist
- **Remaining/limitations:** Real delivery and comprehensive concurrency not verified

## [ ] Phase 1: MFA enrollment and TOTP replay

- **Status:** partial
- **Source:** `src/routes/auths/mfa.route.ts`
- **API:** /api/v1/auth/mfa/totp/*
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/security/mfaReplay.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Monotonic step; MFA on privileged endpoints
- **Frontend:** Web/mobile auth flows exist
- **Remaining/limitations:** Recovery and operational lockout policy unresolved

## [ ] Phase 1: Procurer application and status lookup

- **Status:** partial
- **Source:** `src/routes/identity/procurerApplication.route.ts`
- **API:** /api/v1/procurer-applications
- **Prisma model:** `prisma/models/procurerApplications.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Review permissions and atomic OTP attempts
- **Frontend:** Web/mobile application forms exist
- **Remaining/limitations:** Full rejection, more-info and race tests missing

## [ ] Phase 1: Procurer approval, invitation and activation

- **Status:** partial
- **Source:** `src/repositories/identity/procurerApplication.repository.ts`
- **API:** /api/v1/invitations/*
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Approval, one-time invite and MFA
- **Frontend:** Web/mobile invitation flows exist
- **Remaining/limitations:** Expiry/revocation and concurrent lifecycle tests incomplete

## [ ] Phase 1: Staff and Super Admin management

- **Status:** partial
- **Source:** `src/routes/administrators/staff.route.ts`
- **API:** /api/v1/super-admin/staff/*
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/security/staffConcurrency.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Granular permissions, recent MFA, last-admin protection
- **Frontend:** Web staff routes exist
- **Remaining/limitations:** Bootstrap, reactivation and all permission races not fully verified

## [ ] Phase 1: Role and permission enforcement

- **Status:** partial
- **Source:** `src/middlewares/authenticate.middleware.ts`
- **API:** protected routes
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Server-side MFA and ownership
- **Frontend:** Frontend checks are not authoritative
- **Remaining/limitations:** Full multi-role and active-session permission matrix incomplete

## [ ] Phase 2A: Customer profile

- **Status:** partial
- **Source:** `src/routes/auths/auth.route.ts`
- **API:** GET /api/v1/me
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/auths/registerUser.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Owner access
- **Frontend:** Web/mobile identity clients exist
- **Remaining/limitations:** Customer profile update not implemented

## [ ] Phase 2A: Customer addresses

- **Status:** partial
- **Source:** `src/routes/addresses/address.route.ts`
- **API:** /api/v1/addresses
- **Prisma model:** `prisma/models/address.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Owner-only access
- **Frontend:** Mobile address repository is empty
- **Remaining/limitations:** Preferred address selection and geographic registry missing

## [ ] Phase 2A: Procurer operational profile and availability

- **Status:** partial
- **Source:** `src/routes/procurerServices/procurerServices.route.ts`
- **API:** /api/v1/procurer-services/me
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Verified application, MFA, active role
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** Public profile endpoint, completion requirements and audits incomplete

## [ ] Phase 2A: Service zones and delivery fees

- **Status:** partial
- **Source:** `src/repositories/procurerServices/procurerServices.repository.ts`
- **API:** /api/v1/procurer-services/me/zones
- **Prisma model:** `prisma/models/deliveryZone.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Ownership, eligibility; exact matching
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No official geography identifiers; stale discovery page gaps

## [ ] Phase 2A: Shopping lists and items

- **Status:** partial
- **Source:** `src/routes/shoppingLists/shoppingList.route.ts`
- **API:** /api/v1/shopping-lists
- **Prisma model:** `prisma/models/shoppingList.prisma`
- **Test:** `tests/integration/shoppingLists/shoppingListApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Ownership, immutable submitted state
- **Frontend:** Mobile shopping list repository is empty
- **Remaining/limitations:** Units, item timestamps and idempotent repeated writes missing

## [ ] Phase 2A: Price policy and preview

- **Status:** partial
- **Source:** `src/services/pricing/queries/calculatePricing.query.ts`
- **API:** /api/v1/procurer-services/me/pricing; /api/v1/pricing/preview
- **Prisma model:** `prisma/models/pricingPolicy.prisma`
- **Test:** `tests/unit/pricing/commissionCalculation.test.ts`
- **Result/evidence:** local tests and CI 45641130413 passed
- **Security:** Exact minor units; never trust client total
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** Threshold needs approval; preview nonbinding; no policy retirement

## [ ] Phase 2A: Procurer discovery

- **Status:** partial
- **Source:** `src/repositories/procurerServices/procurerServices.repository.ts`
- **API:** GET /api/v1/procurers/discovery
- **Prisma model:** `prisma/models/deliveryZone.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Do not expose private evidence; eligibility checks
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No rating/ranking, authoritative location registry or full filtering

## [ ] Phase 2A: Shopping request snapshots

- **Status:** partial
- **Source:** `src/repositories/shoppingRequests/shoppingRequest.repository.ts`
- **API:** /api/v1/shopping-requests
- **Prisma model:** `prisma/models/quotation.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Owned snapshots; one request per list/procurer
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No notification or complete request lifecycle

## [ ] Phase 2A: Quotation revision and acceptance

- **Status:** partial
- **Source:** `src/repositories/quotations/quotation.repository.ts`
- **API:** /api/v1/quotations/*
- **Prisma model:** `prisma/models/quotation.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Snapshot prices; reject stale/expired and competing acceptance
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No expiry job, independent commission administration or exhaustive race tests

## [ ] Phase 2A: Order and verified completion

- **Status:** partial
- **Source:** `src/repositories/orders/order.repository.ts`
- **API:** /api/v1/orders/*
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed with isolated payment fixture
- **Security:** Only customer completes after delivery and verified payment
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No production payment verification, refund/reconciliation, complete lifecycle or dispute resolution

## [ ] Phase 2B: Review eligibility and submission

- **Status:** missing
- **Source:** `prisma/models/order.prisma`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Persisted completion, payment, ownership and dispute gates
- **Frontend:** No verified integration
- **Remaining/limitations:** Review model and endpoints absent

## [ ] Phase 2B: Review editing, reporting and moderation

- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Audit moderation; prevent abuse and XSS
- **Frontend:** No verified integration
- **Remaining/limitations:** No review/report/moderation implementation

## [ ] Phase 2B: Rating average, distribution and discovery ranking

- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Persisted eligible reviews; null average for zero
- **Frontend:** No verified integration
- **Remaining/limitations:** No review aggregation or ranking implementation

## [ ] Phase 2C: API and OpenAPI coverage

- **Status:** partial
- **Source:** `src/apis/v1/registerRoutes.ts`
- **API:** /api/v1/*
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed registered paths exercised
- **Security:** Validation, error contracts and auth
- **Frontend:** Clients incomplete
- **Remaining/limitations:** No complete contract validation and some schemas broad

## [ ] Phase 2C: Cross-platform contract parity

- **Status:** partial
- **Source:** `apps/web/src/lib/auth/server.ts`
- **API:** /api/v1/auth/*
- **Prisma model:** `none`
- **Test:** `tests/unit/frontend/apiError.test.ts`
- **Result/evidence:** local tests passed; mobile CI pending
- **Security:** Secure storage; backend authority
- **Frontend:** Auth partial; procurement repositories empty
- **Remaining/limitations:** Full web/mobile API contract and live integration testing missing

## [ ] Phase 2C: Integrated authentication-to-review workflow

- **Status:** missing
- **Source:** `tests/e2e/purchaseFlow.test.ts`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Real roles; fixture-only verified test payment
- **Frontend:** Not integrated
- **Remaining/limitations:** No full end-to-end test or review implementation

## [ ] Phase 2C: Financial operations and production delivery

- **Status:** blocked
- **Source:** `prisma/models/payment.prisma`
- **API:** none
- **Prisma model:** `prisma/models/payment.prisma`
- **Test:** `tests/integration/payments/verifyPayment.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Verify provider and webhook; no real transfers
- **Frontend:** Not integrated
- **Remaining/limitations:** Paystack merchant/provider terms, legal/compliance, ledger, reconciliation and payouts unverified

## [ ] Phase 2C: Production migrations and deployment

- **Status:** blocked
- **Source:** `prisma.config.ts`
- **API:** none
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** disposable db:sync only in CI
- **Security:** No production db push; backups and rollback
- **Frontend:** not applicable
- **Remaining/limitations:** No reviewed migration process compatible with no handwritten SQL

## [ ] Phase 2C: Load, monitoring and operations

- **Status:** blocked
- **Source:** `src/server.ts`
- **API:** GET /api/v1/health
- **Prisma model:** `none`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** liveness only
- **Security:** Monitoring, privacy, rate limits and incident response
- **Frontend:** not applicable
- **Remaining/limitations:** No load evidence, production observability or external ingress review
