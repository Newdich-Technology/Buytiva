# Procurement implementation status

The repository contains functioning identity routes and repositories, but most procurement files are empty. `shoppingList.prisma`, `address.prisma`, `deliveryZone.prisma`, `pricingPolicy.prisma`, `order.prisma`, `quotation.prisma`, and `payment.prisma` contain no models. There are no registered procurement routes, checkout, ledger, or payout implementation. Do not expose the pricing calculation as checkout until the business rules and persistence/authorization design are approved and tested.

## Work added

`calculatePricingQuery` is an isolated deterministic calculation using integer minor units and thousandths for quantities. It rounds each line and each fee half-up. Its **proposed**, not yet approved, rule charges the fixed fee at or below the threshold and a percentage of the entire subtotal above it; commission is deducted from the service fee. It copies and freezes an in-memory result, but this is not a durable immutable snapshot. No API, policy storage or payment flow is wired to it. The operator must confirm the threshold, rounding, quantity precision, currency and commission rules before production use.

The OTP and MFA retry counters now atomically increment every concurrent invalid attempt rather than using a stale attempt count as a compare-and-set. Challenge consumption still uses compare-and-set. The new PostgreSQL concurrency tests require a dedicated disposable `AUTH_TEST_DATABASE_URL`; they were not run in this workspace because PostgreSQL is unavailable.

## Database deployment constraint

Prisma 7.10 uses Prisma Client generated from the multi-file schema; existing `db:sync` uses `prisma db push`, not a versioned migration. There are no migration files. A blanket prohibition on checked-in SQL conflicts with Prisma Migrate's SQL migration history. Do not use `db push` against production as a workaround. Agree on a reviewed production migration mechanism with versioned, auditable changes, backups, rollback/recovery and a disposable rehearsal before adding deployed procurement models. The PostgreSQL integration suites delete records and must never target a production/shared database.

## Outstanding work and validation

- Validate customer, staff and procurer identity integration against disposable PostgreSQL, including OTP expiry/resend, permissions, invitation acceptance and bootstrap. Existing database suites are skipped without a configured test DB.
- Persist procurer operating settings and service coverage, implement customer-owned lists, location-based eligibility, quote/order state machines with transactional concurrency controls, and versioned immutable snapshots.
- Build authorization and integration tests, including cross-customer access, suspension, duplicate requests and rollback, before registering procurement endpoints.
- Paystack is not enabled. Collections, ledger reconciliation, release eligibility and payouts require an independently reviewed financial model and current provider/merchant eligibility; virtual accounts are not individual custody accounts.
- Empty/TODO tests are not coverage. No end-to-end procurement workflow is currently available; no customer-to-procurer HTTP example is represented as working.
