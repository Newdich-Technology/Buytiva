# API coverage matrix

[Domain matrix](API_DATABASE_ROLE_FRONTEND_MATRIX.md) maps route families, models, roles and frontend state. `src/apis/v1/registerRoutes.ts` is the authoritative registration point; `tests/unit/apiCoverage.test.ts` exercises representative OpenAPI paths and unauthenticated calls, not the complete API contract. Controllers, commands, queries, repositories and DTOs are in their centralized `src/` layers by domain. Route schemas are in the relevant `src/routes/` and `src/dtos/` files; not all error schemas are documented. No complete per-method API coverage audit has been completed.

| Family | Route file / controller | Service/repository | Validation and coverage | Status |
|---|---|---|---|---|
| `/auth/*`, `/me` | `routes/auths/`; `controllers/auths/` | `services/auths/`, `repositories/auths/` | `dtos/auths/`; selected identity/auth integration tests | partial |
| `/procurer-applications/*`, `/admin/procurer-applications/*`, `/invitations/*` | `routes/identity/procurerApplication.route.ts`; `controllers/identity/` | `services/identity/`, `repositories/identity/` | `dtos/identity/`; `tests/integration/identity/procurerApplication.test.ts` | partial |
| `/super-admin/*` | `routes/administrators/staff.route.ts`; `controllers/administrators/` | `services/administrators/`, `repositories/administrators/` | `dtos/administrators/staff.dto.ts`; identity/security integration | partial |
| `/addresses/*` | `routes/addresses/address.route.ts`; `controllers/addresses/` | `services/addresses/`, `repositories/addresses/` | `dtos/addresses/address.dto.ts`; services integration | partial |
| `/shopping-lists/*` | `routes/shoppingLists/shoppingList.route.ts`; `controllers/shoppingLists/` | `services/shoppingLists/`, `repositories/shoppingLists/` | `dtos/shoppingLists/shoppingList.dto.ts`; shopping-list integration | partial |
| `/procurer-services/*`, `/procurers/discovery` | `routes/procurerServices/procurerServices.route.ts`; `controllers/procurerServices/` | `services/procurerServices/`, `repositories/procurerServices/` | `dtos/procurerServices/`; services integration | partial |
| `/pricing/preview` | `routes/pricing/pricingPreview.route.ts`; `controllers/pricing/` | `services/pricing/`; reads repositories | route schemas; pricing unit / services integration | partial |
| `/shopping-requests/*` | `routes/shoppingRequests/`; `controllers/shoppingRequests/` | `services/shoppingRequests/`, `repositories/shoppingRequests/` | `dtos/shoppingRequests/`; services integration | partial |
| `/quotations/*`, procurer quotation routes | `routes/quotations/`; `controllers/quotations/` | `services/quotations/`, `repositories/quotations/` | `dtos/quotations/`; services integration | partial |
| `/orders/*`, procurer order routes | `routes/orders/`; `controllers/orders/` | `services/orders/`, `repositories/orders/` | `dtos/orders/`; services integration | partial |
| `/orders/:orderId/review` POST/GET | `routes/reviews/review.route.ts`; `controllers/reviews/` | `services/reviews/`, `repositories/reviews/` | DTO, validator; unit + PostgreSQL regression | private review partial; public ratings, moderation and notifications missing |

Detailed methods, success schemas, authentication and operation IDs are in the route files and runtime OpenAPI; a complete per-endpoint mapping of DTOs, authorization, errors and consumers is still required. Frontend usage is documented in `BACKEND_FRONTEND_PARITY.md`.
