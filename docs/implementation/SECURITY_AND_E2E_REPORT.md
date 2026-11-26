# Security and end-to-end report

## Evidence and fixes in this audit

- Unknown request fields were silently stripped by Fastify, hiding invalid privileged fields. AJV is configured to honor `additionalProperties: false` with 400; `tests/unit/app.test.ts` and the procurer escalation integration assertion cover this. Not every schema disallows extras.
- Unexpected errors were logged with full error objects, which may include sensitive database arguments. The mapper logs only event/request ID; request logs omit query strings. Error handling and specific other logs still require a complete sensitive-data review.
- Oversized requests returned an unhelpful 500; a test now verifies 413 with a safe envelope. Web/mobile previously read a flat error while API uses `{error:{code,message,requestId}}`; adapters and regression tests correct this.
- Order unit tests assert role denial before mutation and payment/transition rules. These mock the repository and are not database concurrency or ownership tests. Selected private endpoint auth and OpenAPI route checks were added.

## Tests and limits

Local `pnpm test --no-file-parallelism`: 96 passed, 19 skipped, 16 TODO (131 total); DB suites skipped without isolated PostgreSQL. Local typecheck, file-length, web check (one existing CSS warning), backend and web builds, and high-severity dependency audit passed. Flutter unavailable locally. `pnpm db:validate` failed locally: first no DATABASE_URL, then Prisma engine download blocked by TLS/network; client generation with `PRISMA_SCHEMA_ENGINE_BINARY=/bin/true` is not schema validation. CI run 45644276246 at `103f507` passed disposable PostgreSQL backend/web/mobile and schema validation. CodeQL flagged reflected XSS in a test-only endpoint that echoed request input; the endpoint was changed to return a fixed response. Follow-up checks must be reviewed for the later commit. CI tests share tables and must run serially on an isolated disposable DB; they are destructive.

A previous PostgreSQL integration flow exercises profile/zone/pricing, list, request, quotation, order and transitions with a directly inserted verified-payment fixture. It does not verify provider payment, a full real customer/procurer onboarding journey, refund, moderation, notifications, or review. `tests/e2e/purchaseFlow.test.ts` is TODO. Cross-customer/role adversarial, idempotency, and concurrency scenarios are incomplete; TODOs do not count as coverage. `tests/unit/apiCoverage.test.ts` uses empty dependency stubs only to inspect registration and unauthenticated boundaries; it is not a backend integration test.

## Release security blockers

Resolve migration strategy, comprehensive authorization and race matrix, cookie CSRF/ingress security headers, secure production secrets and storage, incident monitoring, external SMTP delivery, deployment readiness and customer data retention. Real payment verification/reconciliation, refund/dispute controls, payouts and merchant eligibility are not present. No public endpoint writes verified payment; do not bypass the gate. Commission and threshold rules require product/finance approval. See `docs/security/authenticationReadiness.md` for previous detailed findings and remaining controls.
