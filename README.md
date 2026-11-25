# BUYTIVA Procurement Platform


BUYTIVA is a procurement platform built with Flutter and Dart in apps/mobile, SvelteKit in apps/web, a Node.js, TypeScript, and Fastify API in root src, and PostgreSQL with Prisma in root prisma.

The Ansofra structure is preserved as the complete file map. A path being present does not mean its capability is implemented. Procurer registration, role-management endpoints, discovery, checkout, payment collection, payouts, chat, and file moderation are not yet working features.

## Current verified behavior

- Fastify serves GET /api/v1/health and returns a successful status response.
- The web app renders the procurement landing page with BUYTIVA branding.
- The Flutter app renders the procurement entry screen with the existing green Material 3 theme.
- Prisma schema files define the current database contract. The db:sync package script applies schema synchronization to a configured database after it has been reviewed.
- No production database has been synchronized by this workspace.

See the migration plan at docs/architecture/marketplaceMigration.md for the compatibility audit, phase results, tests, and external blockers. The Ansofra layout remains documented in ansofra-procurement-corrected-structure.md.

## Requirements

- Node.js 22.17 or newer and pnpm 11.24.0
- PostgreSQL for database-backed features
- Flutter 3.38.9 (Dart 3.10) or newer for mobile analysis and tests

## Start the backend

```sh
cp .env.example .env
pnpm install
pnpm dev
```

The API listens on port 3000. Identity and customer shopping-list routes are registered alongside GET /api/v1/health; see the generated OpenAPI documentation at /api/v1/docs. Shopping-list submission does not yet create a quotation or order.

## Start the web app

```sh
pnpm --filter @buytiva/web dev
```

## Start the mobile app

```sh
cd apps/mobile
flutter pub get
flutter run
```

## Checks

```sh
pnpm db:generate
pnpm --filter @buytiva/web check
pnpm test
pnpm typecheck
pnpm build
pnpm check:file-length
pnpm --filter @buytiva/web check
pnpm db:validate
```

Use pnpm db:sync only after reviewing the configured target database. Production financial transfers stay disabled until Paystack eligibility, funds availability, compliance, and approvals are verified.

CI runs the database-backed auth tests against a disposable PostgreSQL database. To run them locally, set `DATABASE_URL` and `AUTH_TEST_DATABASE_URL` to the same dedicated test database, then run `pnpm db:sync` and `pnpm test --no-file-parallelism`. These tests delete authentication records; never point them at production or a shared database. The empty migration directory means this test setup uses schema synchronization, not migration validation.

The mobile and web error catalogs share the same error contract; update both copies together. CI checks their contract fields while allowing platform-specific artwork. The mobile package lockfile has not yet been generated, so Flutter dependency resolution is not currently locked.
