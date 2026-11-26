# Security test report

See `SECURITY_AND_E2E_REPORT.md` for prior results and scope. This continuation identified two concrete gaps by code inspection: stale MFA on application decisions and stale procurer eligibility during order creation. The corresponding server changes and integration regressions are in `src/routes/identity/procurerApplication.route.ts`, `src/repositories/orders/order.repository.ts`, `tests/integration/identity/procurerApplication.test.ts` and `tests/integration/procurerServices/servicesApi.test.ts`. The new tests also cover mismatched currency, reversed/future payment and concurrent customer completion with persisted-state assertions. These cases passed on disposable PostgreSQL in subsequent CI as recorded below.

No public test-payment writer was added. Cross-customer, cross-procurer, privilege escalation, review manipulation, CSRF, idempotency and full concurrent transitions remain incompletely tested. Existing test payment fixture is inserted directly only into a disposable test database. No destructive production tests were run.

`tests/unit/auths/applicationReviewMfa.test.ts` verifies all four review routes reject stale MFA using a mocked principal. `tests/unit/orders/createOrderEligibility.test.ts` checks a mocked transaction denies creation when no eligible zone is found; neither mock establishes real database behavior. Recent-MFA guard now rejects missing, stale, future or invalid timestamps; `tests/unit/auths/recentMfa.test.ts` passed locally. Local full suite: **99 passed, 19 skipped, 16 TODO, 0 failed** (134 tests), with the database suites skipped. Typecheck, file length, backend/web build, web check (one warning), checklist verification and high-severity dependency audit passed locally. `db:validate` could not download Prisma's engine; `db:generate` used a dummy engine override and is not validation. Flutter and PostgreSQL are not installed locally. The initial audit had transient GitHub TLS failures; later pushes and CI results are recorded below.

CI 45665163104 at `9c10cb4` passed disposable PostgreSQL for recent MFA and order-eligibility regressions. The subsequent private-review changes require a fresh CI run. Local current run: 101 passed, 19 skipped, 16 TODO; an initial run failed five web suites because SvelteKit generated configuration was absent after dependency installation, then passed after `pnpm --filter @buytiva/web check`.

CI 45666093815 at `3c73360` passed private-review PostgreSQL creation, duplicate concurrency and ownership tests using isolated payment data. Additional reversed-payment and currency-mismatch review cases were added afterwards and await CI.

CI 45666580444 at `41bb5be` passed additional PostgreSQL review rejection cases for reversed payments and mismatched currency; all CodeQL checks passed. This is not a complete review security suite.

CI 45667707752 at `41136c9` passed disposable PostgreSQL preferred-address ownership, composite foreign-key rejection, concurrent selection and cascade-delete regressions. The customer profile update and authorization tests passed on disposable PostgreSQL in CI 45668238690.

CI 45668579947 at `c70b9d9` passed mobile mock-contract tests and PostgreSQL customer profile/address tests. Discovery invitation-owner pagination now filters before applying offsets; its PostgreSQL regression passed CI 45669122196. Offset scans remain potentially expensive, and no load benchmark has been performed.

CI 45669577753 at `78e7168` passed the mobile shopping-list mock contract test. The API-to-PostgreSQL purchase journey passed subsequent CI; it opts in explicitly to destructive cleanup and refuses database names other than `buytiva_test`. Real provider payment and public reputation remain untested and unavailable.

CI 45691632029 passed private report duplicate concurrency, stale version, role and self-review denial, stale MFA and audited concurrent decisions. A report does not hide a review or alter ratings; snapshots and reasons must be treated as untrusted text. These tests do not prove a public UI is safe from stored XSS, nor cover all cross-account cases.

CI 45740462338 passed the scoped customer HTTP/PostgreSQL race, expiry, revocation and reset rate-limit tests. Malformed signed JWT claims are now rejected; the serializable reset approach initially failed CI 45739637658 intermittently and was replaced with per-account row fencing. This does not establish full red-team or distributed-abuse coverage.
