# Buytiva Procurement Platform

Monorepo for Buytiva: a Fastify/TypeScript backend at the repository root, an owner's SvelteKit dashboard in `apps/web`, and a Flutter customer/admin app in `apps/mobile`. The project follows the layered architecture and naming rules in the supplied Ansofra structure brief.

## Requirements

- Node.js 22 or newer and pnpm 10 or newer
- PostgreSQL for database-backed features
- Flutter stable SDK and Dart for the mobile app

## Start the backend

```sh
cp .env.example .env
pnpm install
pnpm dev
```

The API listens on port 3000. `GET /health` returns `{ "status": "ok" }`.

## Start the dashboard

```sh
pnpm --filter @buytiva/web dev
```

## Start the mobile app

```sh
cd apps/mobile
flutter pub get
flutter run
```

Flutter and Dart are not installed in the current environment. Install the Flutter stable SDK to generate native platform runner files and run the mobile app.

## Checks

```sh
pnpm typecheck
pnpm test
pnpm build
pnpm db:validate
```

