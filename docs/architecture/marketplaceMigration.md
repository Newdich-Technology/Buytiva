# BUYTIVA procurement migration plan

**Author:** Oluwayemi Oyinlola

## Phase 0: compatibility audit

The repository is an existing workspace with root Fastify and Prisma, Flutter under apps/mobile, and SvelteKit under apps/web. The original runtime behavior included a health endpoint, a Flutter landing screen, and a web landing page. The current working tree contains the Ansofra path map and centralized domain layers. Existing user-facing designs and package identities are preserved where functional.

The installed SvelteKit major version rejects svelte.config.js; its configuration remains in the supported Vite plugin file. Flutter is present in the repository but the Flutter SDK is not installed in this environment.

## Phase 1: database and API foundation

Prisma model files are the database contract. Database connectivity and persistence use Prisma Client through centralized database and repository layers. Checked-in SQL migration files are not used. The db:sync script runs Prisma schema synchronization for a reviewed target database; it is not run on application startup. Production schema synchronization requires a reviewed operational procedure and a verified recovery plan.

The existing health endpoint is GET /api/v1/health. The version prefix and path are centralized in src/constants/api.constants.ts. Fastify errors are normalized through src/errors/errorMapper.ts, using the shared AppError type and stable error codes. No other API endpoints are registered yet.

## Current verification

The Ansofra blueprint paths were restored and retained. Comment-only scaffold text was removed from source files; empty test placeholders are explicit Vitest TODO cases and do not count as functional coverage. The source length check currently scans 862 source files with a 250-line maximum.

No procurement application, role-management endpoint, payments, staged releases, support messaging, or moderated file workflow is claimed as implemented. Production financial transfers remain disabled.
