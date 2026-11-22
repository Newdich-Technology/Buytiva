# Frontend to backend parity

The current API inventory is defined by active Fastify composition in `src/apis/v1/registerRoutes.ts` and `src/apis/v1/auth.api.ts`. It contains 40 versioned routes when authentication dependencies are configured: health plus 39 identity, authentication, session, MFA, and staff routes. Other domain route files are empty and are not active endpoints.

The operation-by-operation contract, access policy, request and response schemas, user interface coverage, and automated test references are documented in [endpointInventory.md](./endpointInventory.md).

## Current implementation boundary

Web and Flutter provide registration, email verification, login, login challenge/MFA enrollment, password recovery, procurer application/email/status workflows, invitation acceptance, and a subset of staff administration. Web and Flutter now provide active session listing/revocation, logout-all, and TOTP status/disable in Security settings. Registration OTP resend is wired in both clients. Web Super Admin has staff invitation, permission editing, suspension, revocation, and audit views; Flutter has staff invitation/suspension/revocation, but not permission editing or audit views.

Automated tests do not directly cover resend OTP, session listing/revocation/logout-all, MFA status/disable, procurer own-application read, admin list/detail, or several staff list/catalog/audit/permission routes.

No active routes currently support customer profile/address updates, shopping lists, procurer discovery/profile/pricing, orders, quotes, checkout/payment verification, chat, notifications, refunds, uploads, or settings. The corresponding controller/DTO/validator/repository files do not make these capabilities callable: route modules are empty or absent from active composition. No real-time protocol is configured in the active API composition.

Dashboards must continue to show capability unavailability instead of fabricated totals or pretend controls until these routes are implemented and tested. Payment and money-release operations remain unavailable.
