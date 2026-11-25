# Procurement implementation status

The repository contains functioning identity routes and repositories, but most procurement files are empty. `address.prisma`, `deliveryZone.prisma`, `pricingPolicy.prisma`, `order.prisma`, `quotation.prisma`, and `payment.prisma` contain no models. Shopping-list routes are registered when their repository is provided. Checkout, ledger, and payout implementations are absent. Do not expose the pricing calculation as checkout until the business rules and persistence/authorization design are approved and tested.

## Work added

Shopping lists now have Prisma models and authenticated customer routes for creating, reading, paging, adding, replacing and removing items, deleting drafts, and submitting nonempty drafts. Prices are stored as integer minor units and quantity as thousandths. Submitting only freezes the list; it does not select an address, create a quote or order, or initiate payment. Draft mutations serialize through a parent-row update within a transaction. Production rollout still requires a reviewed migration; CI uses a disposable synchronized schema.

`calculatePricingQuery` is an isolated deterministic calculation using integer minor units and thousandths for quantities. It rounds each line and each fee half-up. Its **proposed**, not yet approved, rule charges the fixed fee at or below the threshold and a percentage of the entire subtotal above it; commission is deducted from the service fee. It copies and freezes an in-memory result, but this is not a durable immutable snapshot. No API, policy storage or payment flow is wired to it. The operator must confirm the threshold, rounding, quantity precision, currency and commission rules before production use.

The OTP and MFA retry counters now atomically increment every concurrent invalid attempt rather than using a stale attempt count as a compare-and-set. Challenge consumption still uses compare-and-set. The new PostgreSQL concurrency tests require a dedicated disposable `AUTH_TEST_DATABASE_URL`; they run in the disposable PostgreSQL service in CI; PostgreSQL is unavailable in this workspace.

## Database deployment constraint

Prisma 7.10 uses Prisma Client generated from the multi-file schema; existing `db:sync` uses `prisma db push`, not a versioned migration. There are no migration files. A blanket prohibition on checked-in SQL conflicts with Prisma Migrate's SQL migration history. Do not use `db push` against production as a workaround. Agree on a reviewed production migration mechanism with versioned, auditable changes, backups, rollback/recovery and a disposable rehearsal before adding deployed procurement models. The PostgreSQL integration suites delete records and must never target a production/shared database.

## Outstanding work and validation

- Validate customer, staff and procurer identity integration against disposable PostgreSQL, including OTP expiry/resend, permissions, invitation acceptance and bootstrap. Existing database suites are skipped without a configured test DB.
- Persist procurer operating settings and service coverage, implement address selection and location-based eligibility, quote/order state machines with transactional concurrency controls, and versioned immutable snapshots.
- Build authorization and integration tests, including cross-customer access, suspension, duplicate requests and rollback, before registering procurement endpoints.
- Paystack is not enabled. Collections, ledger reconciliation, release eligibility and payouts require an independently reviewed financial model and current provider/merchant eligibility; virtual accounts are not individual custody accounts.
- Empty/TODO tests are not coverage. No end-to-end procurement workflow is currently available; no customer-to-procurer HTTP example is represented as working.
