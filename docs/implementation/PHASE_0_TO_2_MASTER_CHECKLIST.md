# Phase 0–2 master implementation checklist

Generated from `checklist.json` by `scripts/ci/checkImplementationChecklist.py`. Evidence is scoped to each entry; partial, missing, blocked and failed entries remain unchecked. Automated existence checks do not establish functional coverage or release readiness.

| Gate | Entries | Verified | Partial | Missing | Blocked | Failed |
|---|---:|---:|---:|---:|---:|---:|
| 0 | 8 | 1 | 7 | 0 | 0 | 0 |
| 1 | 14 | 0 | 14 | 0 | 0 | 0 |
| 2A | 13 | 0 | 13 | 0 | 0 | 0 |
| 2B | 11 | 0 | 4 | 7 | 0 | 0 |
| 2C | 9 | 0 | 6 | 1 | 2 | 0 |

## [ ] Phase 0: Ansofra architecture verified

- **Requirement:** Ansofra architecture verified
- **Status:** partial
- **Source:** `src/app.ts`
- **API:** /api/v1
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** local tests and previous CI passed
- **Security:** Avoid duplicate layers; no handwritten SQL
- **Frontend:** Web and mobile exist
- **Remaining/limitations:** 591 empty src files; architectural and circular dependency audit incomplete; release requirement needs independent verification; CORS, CSRF, security headers and architecture dependency audit remain incomplete

## [ ] Phase 0: Database schema valid

- **Requirement:** Database schema valid
- **Status:** partial
- **Source:** `prisma/schema.prisma`
- **API:** none
- **Prisma model:** `prisma/models/`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed db:validate and disposable PG tests
- **Security:** No destructive sync on production
- **Frontend:** not applicable
- **Remaining/limitations:** No reviewed production migration or full constraint audit; release requirement needs independent verification

## [ ] Phase 0: Fastify bootstrapping works

- **Requirement:** Fastify bootstrapping works
- **Status:** partial
- **Source:** `src/server.ts`
- **API:** GET /api/v1/health
- **Prisma model:** `none`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** liveness test passed; no real startup/shutdown test
- **Security:** Fail closed on DB connection; release resources
- **Frontend:** not applicable
- **Remaining/limitations:** Failure and signal shutdown tests and readiness endpoint missing; release requirement needs independent verification

## [ ] Phase 0: Environment configuration verified

- **Requirement:** Environment configuration verified
- **Status:** partial
- **Source:** `src/configs/auth.config.ts`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/unit/auths/authConfig.test.ts`
- **Result/evidence:** local test passed
- **Security:** Unique strong secrets; TLS and trusted origin
- **Frontend:** Web uses API_BASE_URL; mobile build define
- **Remaining/limitations:** Deployment settings and secret rotation unverified; release requirement needs independent verification

## [ ] Phase 0: Centralized error handling works

- **Requirement:** Centralized error handling works
- **Status:** partial
- **Source:** `src/errors/errorMapper.ts`
- **API:** all registered APIs
- **Prisma model:** `none`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** local tests passed
- **Security:** Reject extra fields and avoid sensitive error logs
- **Frontend:** Error envelope normalization added in both clients
- **Remaining/limitations:** Response/error OpenAPI coverage incomplete; release requirement needs independent verification

## [ ] Phase 0: Authentication dependencies initialize

- **Requirement:** Authentication dependencies initialize
- **Status:** partial
- **Source:** `src/server.ts`
- **API:** GET /api/v1/health
- **Prisma model:** `none`
- **Test:** `tests/unit/app.test.ts`
- **Result/evidence:** liveness test passed; no real startup/shutdown test
- **Security:** Fail closed on DB connection; release resources
- **Frontend:** not applicable
- **Remaining/limitations:** Failure and signal shutdown tests and readiness endpoint missing; release requirement needs independent verification

## [ ] Phase 0: Logging and background processing work

- **Requirement:** Logging and background processing work
- **Status:** partial
- **Source:** `src/jobs/workers/processAuthEmailOutbox.job.ts`
- **API:** none
- **Prisma model:** `prisma/models/outboxEvent.prisma`
- **Test:** `tests/integration/outbox/emailOutbox.test.ts`
- **Result/evidence:** CI 45641130413 passed with fake provider
- **Security:** No secret logs; retries may duplicate SMTP
- **Frontend:** not applicable
- **Remaining/limitations:** Production SMTP, monitoring and delivery reconciliation unverified; release requirement needs independent verification

## [x] Phase 0: File-length checks pass

- **Requirement:** File-length checks pass
- **Status:** verified
- **Source:** `scripts/checkFileLength.ts`
- **API:** none
- **Prisma model:** `none`
- **Test:** `scripts/checkFileLength.ts`
- **Result/evidence:** local check passed; CI 45644677058 passed on e52c4ed
- **Security:** 250-line limit
- **Frontend:** Both platforms included by script
- **Remaining/limitations:** Does not prove business correctness

## [ ] Phase 1: Customer registration works

- **Requirement:** Customer registration works
- **Status:** partial
- **Source:** `src/routes/auths/auth.route.ts`
- **API:** POST /api/v1/auth/register; /auth/email-otp/verify
- **Prisma model:** `prisma/models/authCredentials.prisma`
- **Test:** `tests/integration/auths/registerUser.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Hash OTP; atomic consume; rate limit
- **Frontend:** Web/mobile auth clients exist
- **Remaining/limitations:** Real SMTP, expiry/resend exhaustive HTTP cases remain; release requirement needs independent verification

## [ ] Phase 1: OTP verification works

- **Requirement:** OTP verification works
- **Status:** partial
- **Source:** `src/routes/auths/auth.route.ts`
- **API:** POST /api/v1/auth/register; /auth/email-otp/verify
- **Prisma model:** `prisma/models/authCredentials.prisma`
- **Test:** `tests/integration/auths/registerUser.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Hash OTP; atomic consume; rate limit
- **Frontend:** Web/mobile auth clients exist
- **Remaining/limitations:** Real SMTP, expiry/resend exhaustive HTTP cases remain; release requirement needs independent verification

## [ ] Phase 1: Password login works

- **Requirement:** Password login works
- **Status:** partial
- **Source:** `src/routes/auths/session.route.ts`
- **API:** /api/v1/auth/login; /auth/refresh; /auth/logout
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/security/sessionConcurrency.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Replay revokes family; ownership; no token logs
- **Frontend:** Web/mobile auth clients exist
- **Remaining/limitations:** Full session expiry and device HTTP matrix incomplete; release requirement needs independent verification

## [ ] Phase 1: Sessions work

- **Requirement:** Sessions work
- **Status:** partial
- **Source:** `src/routes/auths/session.route.ts`
- **API:** /api/v1/auth/login; /auth/refresh; /auth/logout
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/security/sessionConcurrency.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Replay revokes family; ownership; no token logs
- **Frontend:** Web/mobile auth clients exist
- **Remaining/limitations:** Full session expiry and device HTTP matrix incomplete; release requirement needs independent verification

## [ ] Phase 1: Refresh-token rotation works

- **Requirement:** Refresh-token rotation works
- **Status:** partial
- **Source:** `src/routes/auths/session.route.ts`
- **API:** /api/v1/auth/login; /auth/refresh; /auth/logout
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/security/sessionConcurrency.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Replay revokes family; ownership; no token logs
- **Frontend:** Web/mobile auth clients exist
- **Remaining/limitations:** Full session expiry and device HTTP matrix incomplete; release requirement needs independent verification

## [ ] Phase 1: Password reset works

- **Requirement:** Password reset works
- **Status:** partial
- **Source:** `src/services/auths/commands/resetPassword.command.ts`
- **API:** /api/v1/auth/password/reset; /auth/password/change
- **Prisma model:** `prisma/models/passwordReset.prisma`
- **Test:** `tests/integration/auths/registerUser.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** One-time reset; invalidate sessions
- **Frontend:** Web/mobile forms exist
- **Remaining/limitations:** Real delivery and comprehensive concurrency not verified; release requirement needs independent verification

## [ ] Phase 1: MFA works

- **Requirement:** MFA works
- **Status:** partial
- **Source:** `src/routes/auths/mfa.route.ts`
- **API:** /api/v1/auth/mfa/totp/*
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/security/mfaReplay.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Monotonic step; MFA on privileged endpoints
- **Frontend:** Web/mobile auth flows exist
- **Remaining/limitations:** Recovery and operational lockout policy unresolved; release requirement needs independent verification

## [ ] Phase 1: Procurer applications work

- **Requirement:** Procurer applications work
- **Status:** partial
- **Source:** `src/routes/identity/procurerApplication.route.ts`
- **API:** /api/v1/procurer-applications
- **Prisma model:** `prisma/models/procurerApplications.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed; recent-MFA route unit test passed locally; new PostgreSQL regression not executed
- **Security:** Review permissions and atomic OTP attempts
- **Frontend:** Web/mobile application forms exist
- **Remaining/limitations:** Full rejection, more-info and race tests missing; release requirement needs independent verification

## [ ] Phase 1: Procurer approval works

- **Requirement:** Procurer approval works
- **Status:** partial
- **Source:** `src/repositories/identity/procurerApplication.repository.ts`
- **API:** /api/v1/invitations/*
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45665163104 passed on 9c10cb4 including recent MFA PostgreSQL regression; complete lifecycle still unverified
- **Security:** Approval, one-time invite and MFA
- **Frontend:** Web/mobile invitation flows exist
- **Remaining/limitations:** Expiry/revocation and concurrent lifecycle tests incomplete; release requirement needs independent verification

## [ ] Phase 1: Invitations work

- **Requirement:** Invitations work
- **Status:** partial
- **Source:** `src/repositories/identity/procurerApplication.repository.ts`
- **API:** /api/v1/invitations/*
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Approval, one-time invite and MFA
- **Frontend:** Web/mobile invitation flows exist
- **Remaining/limitations:** Expiry/revocation and concurrent lifecycle tests incomplete; release requirement needs independent verification

## [ ] Phase 1: Admin management works

- **Requirement:** Admin management works
- **Status:** partial
- **Source:** `src/routes/administrators/staff.route.ts`
- **API:** /api/v1/super-admin/staff/*
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/security/staffConcurrency.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Granular permissions, recent MFA, last-admin protection
- **Frontend:** Web staff routes exist
- **Remaining/limitations:** Bootstrap, reactivation and all permission races not fully verified; release requirement needs independent verification

## [ ] Phase 1: Super Admin management works

- **Requirement:** Super Admin management works
- **Status:** partial
- **Source:** `src/routes/administrators/staff.route.ts`
- **API:** /api/v1/super-admin/staff/*
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/security/staffConcurrency.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Granular permissions, recent MFA, last-admin protection
- **Frontend:** Web staff routes exist
- **Remaining/limitations:** Bootstrap, reactivation and all permission races not fully verified; release requirement needs independent verification

## [ ] Phase 1: Role permissions work

- **Requirement:** Role permissions work
- **Status:** partial
- **Source:** `src/middlewares/authenticate.middleware.ts`
- **API:** protected routes
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Server-side MFA and ownership
- **Frontend:** Frontend checks are not authoritative
- **Remaining/limitations:** Full multi-role and active-session permission matrix incomplete; release requirement needs independent verification

## [ ] Phase 1: Security tests pass

- **Requirement:** Security tests pass
- **Status:** partial
- **Source:** `src/middlewares/authenticate.middleware.ts`
- **API:** protected routes
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Server-side MFA and ownership
- **Frontend:** Frontend checks are not authoritative
- **Remaining/limitations:** Full multi-role and active-session permission matrix incomplete; release requirement needs independent verification

## [ ] Phase 2A: Customer addresses work

- **Requirement:** Customer addresses work
- **Status:** partial
- **Source:** `src/routes/addresses/address.route.ts`
- **API:** /api/v1/addresses
- **Prisma model:** `prisma/models/address.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Owner-only access
- **Frontend:** Mobile address repository is empty
- **Remaining/limitations:** Preferred address selection and geographic registry missing; release requirement needs independent verification

## [ ] Phase 2A: Procurer profiles work

- **Requirement:** Procurer profiles work
- **Status:** partial
- **Source:** `src/routes/procurerServices/procurerServices.route.ts`
- **API:** /api/v1/procurer-services/me
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Verified application, MFA, active role
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** Public profile endpoint, completion requirements and audits incomplete; release requirement needs independent verification

## [ ] Phase 2A: Service zones work

- **Requirement:** Service zones work
- **Status:** partial
- **Source:** `src/repositories/procurerServices/procurerServices.repository.ts`
- **API:** /api/v1/procurer-services/me/zones
- **Prisma model:** `prisma/models/deliveryZone.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Ownership, eligibility; exact matching
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No official geography identifiers; stale discovery page gaps; release requirement needs independent verification

## [ ] Phase 2A: Availability works

- **Requirement:** Availability works
- **Status:** partial
- **Source:** `src/routes/procurerServices/procurerServices.route.ts`
- **API:** /api/v1/procurer-services/me
- **Prisma model:** `prisma/models/identityAccess.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Verified application, MFA, active role
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** Public profile endpoint, completion requirements and audits incomplete; release requirement needs independent verification

## [ ] Phase 2A: Pricing policies work

- **Requirement:** Pricing policies work
- **Status:** partial
- **Source:** `src/services/pricing/queries/calculatePricing.query.ts`
- **API:** /api/v1/procurer-services/me/pricing; /api/v1/pricing/preview
- **Prisma model:** `prisma/models/pricingPolicy.prisma`
- **Test:** `tests/unit/pricing/commissionCalculation.test.ts`
- **Result/evidence:** local tests and CI 45641130413 passed
- **Security:** Exact minor units; never trust client total
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** Threshold needs approval; preview nonbinding; no policy retirement; release requirement needs independent verification

## [ ] Phase 2A: Shopping lists work

- **Requirement:** Shopping lists work
- **Status:** partial
- **Source:** `src/routes/shoppingLists/shoppingList.route.ts`
- **API:** /api/v1/shopping-lists
- **Prisma model:** `prisma/models/shoppingList.prisma`
- **Test:** `tests/integration/shoppingLists/shoppingListApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Ownership, immutable submitted state
- **Frontend:** Mobile shopping list repository is empty
- **Remaining/limitations:** Units, item timestamps and idempotent repeated writes missing; release requirement needs independent verification

## [ ] Phase 2A: Shopping item operations work

- **Requirement:** Shopping item operations work
- **Status:** partial
- **Source:** `src/routes/shoppingLists/shoppingList.route.ts`
- **API:** /api/v1/shopping-lists
- **Prisma model:** `prisma/models/shoppingList.prisma`
- **Test:** `tests/integration/shoppingLists/shoppingListApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Ownership, immutable submitted state
- **Frontend:** Mobile shopping list repository is empty
- **Remaining/limitations:** Units, item timestamps and idempotent repeated writes missing; release requirement needs independent verification

## [ ] Phase 2A: Procurer discovery works

- **Requirement:** Procurer discovery works
- **Status:** partial
- **Source:** `src/repositories/procurerServices/procurerServices.repository.ts`
- **API:** GET /api/v1/procurers/discovery
- **Prisma model:** `prisma/models/deliveryZone.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Do not expose private evidence; eligibility checks
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No rating/ranking, authoritative location registry or full filtering; release requirement needs independent verification

## [ ] Phase 2A: Quotations work

- **Requirement:** Quotations work
- **Status:** partial
- **Source:** `src/repositories/quotations/quotation.repository.ts`
- **API:** /api/v1/quotations/*
- **Prisma model:** `prisma/models/quotation.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Snapshot prices; reject stale/expired and competing acceptance
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No expiry job, independent commission administration or exhaustive race tests; release requirement needs independent verification

## [ ] Phase 2A: Orders work

- **Requirement:** Orders work
- **Status:** partial
- **Source:** `src/repositories/orders/order.repository.ts`
- **API:** /api/v1/orders/*
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45665163104 passed on 9c10cb4 with isolated payment fixture, eligibility rechecks and concurrent completion; no provider payment
- **Security:** Only customer completes after delivery and verified payment
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No production payment verification, refund/reconciliation, complete lifecycle or dispute resolution; release requirement needs independent verification

## [ ] Phase 2A: Order transitions work

- **Requirement:** Order transitions work
- **Status:** partial
- **Source:** `src/repositories/orders/order.repository.ts`
- **API:** /api/v1/orders/*
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45665163104 passed on 9c10cb4 with isolated payment fixture, eligibility rechecks and concurrent completion; no provider payment
- **Security:** Only customer completes after delivery and verified payment
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No production payment verification, refund/reconciliation, complete lifecycle or dispute resolution; release requirement needs independent verification

## [ ] Phase 2A: Verified completion works

- **Requirement:** Verified completion works
- **Status:** partial
- **Source:** `src/repositories/orders/order.repository.ts`
- **API:** /api/v1/orders/*
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45665163104 passed on 9c10cb4 with isolated payment fixture, eligibility rechecks and concurrent completion; no provider payment
- **Security:** Only customer completes after delivery and verified payment
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No production payment verification, refund/reconciliation, complete lifecycle or dispute resolution; release requirement needs independent verification

## [ ] Phase 2A: Ownership checks pass

- **Requirement:** Ownership checks pass
- **Status:** partial
- **Source:** `src/repositories/orders/order.repository.ts`
- **API:** /api/v1/orders/*
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45665163104 passed on 9c10cb4 with isolated payment fixture, eligibility rechecks and concurrent completion; no provider payment
- **Security:** Only customer completes after delivery and verified payment
- **Frontend:** No verified frontend integration
- **Remaining/limitations:** No production payment verification, refund/reconciliation, complete lifecycle or dispute resolution; release requirement needs independent verification

## [ ] Phase 2B: Review eligibility works

- **Requirement:** Review eligibility works
- **Status:** partial
- **Source:** `src/repositories/reviews/review.repository.ts`
- **API:** POST/GET /api/v1/orders/:orderId/review
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** Implementation and integration regression added; current PostgreSQL CI pending
- **Security:** Owner, completed history, matched non-reversed payment, no self-review, serializable uniqueness; private only
- **Frontend:** Not integrated
- **Remaining/limitations:** No moderation, public visibility, refund integration or deployed-provider verification; PostgreSQL validation pending

## [ ] Phase 2B: Rating submission works

- **Requirement:** Rating submission works
- **Status:** partial
- **Source:** `src/repositories/reviews/review.repository.ts`
- **API:** POST/GET /api/v1/orders/:orderId/review
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** Implementation and integration regression added; current PostgreSQL CI pending
- **Security:** Owner, completed history, matched non-reversed payment, no self-review, serializable uniqueness; private only
- **Frontend:** Not integrated
- **Remaining/limitations:** No moderation, public visibility, refund integration or deployed-provider verification; PostgreSQL validation pending

## [ ] Phase 2B: Written comments work

- **Requirement:** Written comments work
- **Status:** partial
- **Source:** `src/repositories/reviews/review.repository.ts`
- **API:** POST/GET /api/v1/orders/:orderId/review
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** Implementation and integration regression added; current PostgreSQL CI pending
- **Security:** Owner, completed history, matched non-reversed payment, no self-review, serializable uniqueness; private only
- **Frontend:** Not integrated
- **Remaining/limitations:** No moderation, public visibility, refund integration or deployed-provider verification; PostgreSQL validation pending

## [ ] Phase 2B: Duplicate prevention works

- **Requirement:** Duplicate prevention works
- **Status:** partial
- **Source:** `src/repositories/reviews/review.repository.ts`
- **API:** POST/GET /api/v1/orders/:orderId/review
- **Prisma model:** `prisma/models/order.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** Implementation and integration regression added; current PostgreSQL CI pending
- **Security:** Owner, completed history, matched non-reversed payment, no self-review, serializable uniqueness; private only
- **Frontend:** Not integrated
- **Remaining/limitations:** No moderation, public visibility, refund integration or deployed-provider verification; PostgreSQL validation pending

## [ ] Phase 2B: Review editing rules work

- **Requirement:** Review editing rules work
- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Audit moderation; prevent abuse and XSS
- **Frontend:** No verified integration
- **Remaining/limitations:** No review/report/moderation implementation

## [ ] Phase 2B: Rating averages work

- **Requirement:** Rating averages work
- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Persisted eligible reviews; null average for zero
- **Frontend:** No verified integration
- **Remaining/limitations:** No review aggregation or ranking implementation

## [ ] Phase 2B: Review counts work

- **Requirement:** Review counts work
- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Persisted eligible reviews; null average for zero
- **Frontend:** No verified integration
- **Remaining/limitations:** No review aggregation or ranking implementation

## [ ] Phase 2B: Rating distributions work

- **Requirement:** Rating distributions work
- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Persisted eligible reviews; null average for zero
- **Frontend:** No verified integration
- **Remaining/limitations:** No review aggregation or ranking implementation

## [ ] Phase 2B: Public review queries work

- **Requirement:** Public review queries work
- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Audit moderation; prevent abuse and XSS
- **Frontend:** No verified integration
- **Remaining/limitations:** No review/report/moderation implementation

## [ ] Phase 2B: Review moderation works

- **Requirement:** Review moderation works
- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Audit moderation; prevent abuse and XSS
- **Frontend:** No verified integration
- **Remaining/limitations:** No review/report/moderation implementation

## [ ] Phase 2B: Review security tests pass

- **Requirement:** Review security tests pass
- **Status:** missing
- **Source:** `docs/architecture/procurementReputationHandoff.md`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Audit moderation; prevent abuse and XSS
- **Frontend:** No verified integration
- **Remaining/limitations:** No review/report/moderation implementation

## [ ] Phase 2C: Relevant APIs are registered

- **Requirement:** Relevant APIs are registered
- **Status:** partial
- **Source:** `src/apis/v1/registerRoutes.ts`
- **API:** /api/v1/*
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed registered paths exercised
- **Security:** Validation, error contracts and auth
- **Frontend:** Clients incomplete
- **Remaining/limitations:** No complete contract validation and some schemas broad; release requirement needs independent verification

## [ ] Phase 2C: OpenAPI contracts are accurate

- **Requirement:** OpenAPI contracts are accurate
- **Status:** partial
- **Source:** `src/apis/v1/registerRoutes.ts`
- **API:** /api/v1/*
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed registered paths exercised
- **Security:** Validation, error contracts and auth
- **Frontend:** Clients incomplete
- **Remaining/limitations:** No complete contract validation and some schemas broad; release requirement needs independent verification

## [ ] Phase 2C: Database-backed integration tests pass

- **Requirement:** Database-backed integration tests pass
- **Status:** partial
- **Source:** `prisma/schema.prisma`
- **API:** none
- **Prisma model:** `prisma/models/`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed db:validate and disposable PG tests
- **Security:** No destructive sync on production
- **Frontend:** not applicable
- **Remaining/limitations:** No reviewed production migration or full constraint audit; release requirement needs independent verification

## [ ] Phase 2C: Complete procurement workflow passes

- **Requirement:** Complete procurement workflow passes
- **Status:** missing
- **Source:** `tests/e2e/purchaseFlow.test.ts`
- **API:** none
- **Prisma model:** `none`
- **Test:** `tests/e2e/purchaseFlow.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Real roles; fixture-only verified test payment
- **Frontend:** Not integrated
- **Remaining/limitations:** No full end-to-end test or review implementation

## [ ] Phase 2C: Security regression tests pass

- **Requirement:** Security regression tests pass
- **Status:** partial
- **Source:** `src/middlewares/authenticate.middleware.ts`
- **API:** protected routes
- **Prisma model:** `prisma/models/user.prisma`
- **Test:** `tests/integration/identity/procurerApplication.test.ts`
- **Result/evidence:** CI 45641130413 passed
- **Security:** Server-side MFA and ownership
- **Frontend:** Frontend checks are not authoritative
- **Remaining/limitations:** Full multi-role and active-session permission matrix incomplete; release requirement needs independent verification

## [ ] Phase 2C: Frontend API parity has been audited

- **Requirement:** Frontend API parity has been audited
- **Status:** partial
- **Source:** `apps/web/src/lib/auth/server.ts`
- **API:** /api/v1/auth/*
- **Prisma model:** `none`
- **Test:** `tests/unit/frontend/apiError.test.ts`
- **Result/evidence:** local tests passed; mobile CI pending
- **Security:** Secure storage; backend authority
- **Frontend:** Auth partial; procurement repositories empty
- **Remaining/limitations:** Full web/mobile API contract and live integration testing missing; release requirement needs independent verification

## [ ] Phase 2C: CI checks pass

- **Requirement:** CI checks pass
- **Status:** partial
- **Source:** `src/apis/v1/registerRoutes.ts`
- **API:** /api/v1/*
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** CI 45641130413 passed registered paths exercised
- **Security:** Validation, error contracts and auth
- **Frontend:** Clients incomplete
- **Remaining/limitations:** No complete contract validation and some schemas broad; release requirement needs independent verification

## [ ] Phase 2C: External blockers are documented

- **Requirement:** External blockers are documented
- **Status:** blocked
- **Source:** `prisma/models/payment.prisma`
- **API:** none
- **Prisma model:** `prisma/models/payment.prisma`
- **Test:** `tests/integration/payments/verifyPayment.test.ts`
- **Result/evidence:** TODO; not executed
- **Security:** Verify provider and webhook; no real transfers
- **Frontend:** Not integrated
- **Remaining/limitations:** Paystack merchant/provider terms, legal/compliance, ledger, reconciliation and payouts unverified

## [ ] Phase 2C: Release-readiness report is complete

- **Requirement:** Release-readiness report is complete
- **Status:** blocked
- **Source:** `prisma.config.ts`
- **API:** none
- **Prisma model:** `prisma/schema.prisma`
- **Test:** `tests/integration/procurerServices/servicesApi.test.ts`
- **Result/evidence:** disposable db:sync only in CI
- **Security:** No production db push; backups and rollback
- **Frontend:** not applicable
- **Remaining/limitations:** No reviewed migration process compatible with no handwritten SQL
