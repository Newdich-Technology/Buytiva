# Role and permission matrix

Enforcement lives in `src/middlewares/authenticate.middleware.ts` and each registered route, not in the frontend. Principal data are reloaded for protected requests; users must be active and email verified. The table describes intended observed restrictions, not proof of a complete adversarial matrix.

| Actor | Capabilities | Restrictions / evidence |
|---|---|---|
| Anonymous | registration, email verification, login, application and invitation challenges | rate limits and challenge validation; see `routes/auths/`, `routes/identity/` |
| Customer | owned addresses/lists/requests, discover, decide quote, create/read/confirm own order | role required; repository ownership; no procurer completion or privileged grants |
| Procurer | eligible own profile/zones/pricing, assigned requests/quotes/orders, report delivery | active profile and MFA; eligibility conditions rechecked; cannot confirm customer completion |
| Admin | application read/review only with stored corresponding permission | MFA required; this change adds recent MFA to review decisions; no super-admin operations |
| Super Admin | staff invitation/access/permission and audit operations; application review | active staff and MFA, recent MFA for staff changes and application decisions; last-admin protection |
| Suspended/unverified | no protected resource access | middleware rejects principal; more lifecycle cases need independent tests |

`src/constants/administration/permission.constants.ts` lists permission codes; many domains don't yet implement admin operations. Multi-role behavior, concurrent permission revocation, complete cross-owner and stale-session tests are incomplete. Test path examples: `tests/integration/identity/procurerApplication.test.ts`, `tests/integration/security/staffConcurrency.test.ts`, `tests/integration/procurerServices/servicesApi.test.ts`.
