# API, database, role and frontend audit matrix

Evidence scope is representative, not exhaustive: see `src/apis/v1/registerRoutes.ts`, registered route files, schemas, `docs/backend/procurementImplementationStatus.md`, and the master checklist. `tests/unit/apiCoverage.test.ts` confirms selected route families appear in OpenAPI and rejects unauthenticated requests; it does not verify every schema or successful authorized call.

| Family (prefix `/api/v1`) | Models / persistence | Access | Web / mobile | State |
|---|---|---|---|---|
| `/health` | none | public | no consumer required | liveness tested |
| `/auth/*`, `/me` | user, credentials, sessions, challenges, outbox | public challenge endpoints; session-owned protected endpoints | auth integrations exist | partial; real SMTP not verified |
| `/procurer-applications/*`, `/invitations/*` | applications, invitation, challenges | public verified application/activation; authorized staff review | forms/clients exist | partial |
| `/super-admin/*`, `/admin/procurer-applications/*` | permissions, staff, audit, applications | server-side role and granular permissions; recent MFA for sensitive staff operations | some administration clients | partial; not all operations exist |
| `/addresses[/:addressId]` | Address | active authenticated customer, owner scoped | mobile repository implemented; screens empty; web procurement not integrated | partial |
| `/shopping-lists/*` | ShoppingList and items | customer owner | mobile repository implemented; screens empty | partial |
| `/procurer-services/me`, `/me/zones`, `/me/pricing` | profile, zones, versioned policy | active eligible procurer with MFA | not verified integrated | partial |
| `/procurers/discovery`, `/pricing/preview` | profile, zones, pricing, customer address/list | authenticated customer | not verified integrated | partial, preview nonbinding |
| `/shopping-requests/*`, `/procurer-services/me/requests/*` | request snapshots | customer owner / assigned eligible procurer | not verified integrated | partial |
| `/quotations/*`, `/procurer-services/me/*/quotations` | versioned quotation and items | assigned procurer issues; owning customer accepts/rejects | mobile provider empty | partial |
| `/orders/*`, `/procurer-services/me/orders/*` | order, actor history, verified payment record | owner/assigned procurer; completion customer only; payment gates fulfillment | mobile provider empty | partial; no live payment writer |
| `/orders/:orderId/review` | OrderReview | customer owner | no verified integration | private create/read and audited moderation partial; ratings missing |

Security and schema nuances: request schemas with `additionalProperties: false` now reject unknown fields; some schemas may allow extras intentionally and need review. OpenAPI has documented success schemas on many routes but complete error/authorization parity has not been proven. CI applies `db:sync` only to a disposable instance; it is not a production migration. Ten empty schema files include notification, refund, messaging and idempotency. Structural file existence is not implementation. Web normalizes nested API errors; mobile extracts the nested message, but mobile networking and all procurement screens need real contract tests. The example web API base URL is server-side and not a browser localhost call; mobile build configuration must target the actual reachable service.
