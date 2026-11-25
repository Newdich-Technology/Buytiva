# Backend/frontend parity

Audit is partial. No UI existence claim constitutes integration. The authoritative API routes are in `src/apis/v1/registerRoutes.ts`; errors use `{error:{code,message,requestId}}`. Web `apps/web/src/lib/auth/server.ts` normalizes that envelope and uses server-side API_BASE_URL. Mobile `apps/mobile/lib/core/network/api_client.dart` extracts nested messages; its API base is a compile-time setting and must be reachable from the device. Both adapters have focused tests, but not full deployed contracts.

| Capability | Backend / request and response | SvelteKit | Flutter | Auth / status |
|---|---|---|---|---|
| Registration, login, OTP, sessions | `/auth/*`, `/me`, DTOs in `src/dtos/auths/` | auth server actions (`routes/(auth)`, register/verifyEmail) | `features/auth/auth_repository.dart` | public challenge or bearer as appropriate; partial |
| Application and invitation | `/procurer-applications/*`, `/invitations/*`, identity DTOs | application and invitation actions | auth repository | public challenge/optional bearer; partial |
| Admin review | `/admin/procurer-applications/*`, identity DTOs | procurerApplications server actions | auth repository partially supports administration | bearer, staff permission, MFA; partial |
| Customer profile, addresses | `GET/PATCH /me`, `/addresses` and `/addresses/preferred`, auth/address DTOs | no verified procurement consumer | address repository implemented and contract-tested with a mock; mobile CI 45668579947 passed; screens empty | bearer/customer owner; missing procurement integration |
| Procurer profile, zones, pricing | `/procurer-services/me/*`, procurer-services DTOs | no verified consumer | no verified consumer | bearer/active procurer/MFA; missing |
| Lists, items, discovery | `/shopping-lists/*`, `/procurers/discovery`, list and discovery DTOs | no verified consumer | shopping-list repository and screens empty | bearer/customer; missing |
| Requests, quotes, orders, delivery confirmation | `/shopping-requests/*`, `/quotations/*`, `/orders/*`, corresponding DTOs | no verified consumer | quotation/order providers empty | bearer/owner or assigned procurer; missing |
| Reviews, ratings, notifications | private `/orders/:orderId/review`; no public ratings/notification API | not integrated | placeholders/empty | private review partial; other features missing |

Request/response types above reference backend DTOs, not proven matching frontend-generated types. More precise per-method parity, reauthentication UX for recent MFA, client refresh/error handling, pagination and deployed cross-origin tests remain open. No interface redesign was undertaken.
