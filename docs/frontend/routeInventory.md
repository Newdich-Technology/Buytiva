# SvelteKit route inventory

The root layout renders `SiteHeader` and `SiteFooter` around route content. Dashboard routes also pass through the authenticated dashboard layout. This inventory lists every current page and error component under `apps/web/src/routes`; it does not treat redirects as visual verification. A production preview was used for public-route smoke requests and homepage responsive checks at 320, 360, 375, 390, 430, 768, 1024, 1280, 1440, and 1920 CSS pixels.

## Public, identity, and invitation routes

| Route | Entry file | Access and implementation | Visual check in this pass |
|---|---|---|---|
| `/` | `+page.svelte` | Public marketing page; original editorial hero, how-it-works, procurer, FAQ/download sections | Desktop and 390px mobile, light and dark |
| `/login` | `(auth)/login/+page.svelte` | Public login and challenge flow | Dark desktop |
| `/register` | `register/+page.svelte` | Public customer registration | Not individually rendered |
| `/verifyEmail` | `verifyEmail/+page.svelte` | Email verification and resend flow | Not individually rendered |
| `/forgotPassword` | `(auth)/forgotPassword/+page.svelte` | Password recovery | Not individually rendered |
| `/apply/procurer` | `apply/procurer/+page.svelte` | Public multi-step procurer application | Not individually rendered in this pass |
| `/apply/procurer/verify` | `apply/procurer/verify/+page.svelte` | Application email verification | Not individually rendered |
| `/application/status` | `application/status/+page.svelte` | Public application tracking | Not individually rendered |
| `/invitation` | `invitation/+page.svelte` | Invitation preview and acceptance | Not individually rendered |
| `/*` not found | `+error.svelte` | Root error boundary; shared root shell | Unknown route, dark desktop |
| `/how-it-works` | `how-it-works/+page.svelte` | Editorial journey explainer; separates available onboarding from planned commerce capability | Desktop and 390px mobile, light; desktop dark |
| `/for-procurers` | `for-procurers/+page.svelte` | Application, email verification, review, single-use invitation, preparation checklist and FAQs | Desktop and 390px mobile, light; desktop dark |
| `/faq` | `faq/+page.svelte` | Expanded availability, account, application, checkout and support answers | Production preview route smoke |
| `/about` | `about/+page.svelte` | Product and ownership information | Production preview route smoke |
| `/contact` | `contact/+page.svelte` | Contact paths based on verified available routes | Production preview route smoke |
| `/support` | `support/+page.svelte` | Self-service help paths; no unsupported live support claim | Production preview route smoke |
| `/coverage` | `coverage/+page.svelte` | Explains current coverage visibility limitation | Production preview route smoke |
| `/terms`, `/privacy`, `/refund-policy`, `/accessibility` | Corresponding route folders | Policy content is explicitly pending organizational approval | Production preview route smoke |
| `/cookies` | `cookies/+page.svelte` | Consent status and preferences; versioned functional storage opt-in | Production preview route smoke |
| `/for-procurers/apply`, `/for-procurers/application-status` | Redirect server routes | Aliases to procurer application and tracking paths | Redirect smoke only |

## Authenticated dashboard routes

These routes are guarded by `(dashboard)/+layout.server.ts`; route data and action permissions remain defined by their individual server modules and the backend.

| Route | Entry file | Notes | Visual check in this pass |
|---|---|---|---|
| `/overview` | `(dashboard)/overview/+page.svelte` | Role-specific overview | Not individually rendered with an authenticated session |
| `/application` | `(dashboard)/application/+page.svelte` | Procurer application status | Not individually rendered with an authenticated session |
| `/procurerApplications` | `(dashboard)/procurerApplications/+page.svelte` | Permission-gated staff review | Not individually rendered with an authorized staff session |
| `/administrators` | `(dashboard)/administrators/+page.svelte` | Super Admin staff management | Not individually rendered with an authorized session |
| `/auditLogs` | `(dashboard)/auditLogs/+page.svelte` | Super Admin audit history | Not individually rendered with an authorized session; current page is a placeholder |
| `/customers` | `(dashboard)/customers/+page.svelte` | Current page is a placeholder | Not individually rendered |
| `/deliveryZones` | `(dashboard)/deliveryZones/+page.svelte` | Current page is a placeholder | Not individually rendered |
| `/messages` | `(dashboard)/messages/+page.svelte` | Current page is a placeholder; no active realtime backend route is listed in `endpointInventory.md` | Not individually rendered |
| `/messages/[id]` | `(dashboard)/messages/[id]/+page.svelte` | Current page is a placeholder; no active realtime backend route is listed in `endpointInventory.md` | Not individually rendered |
| `/orders` | `(dashboard)/orders/+page.svelte` | Current page is a placeholder | Not individually rendered |
| `/orders/[id]` | `(dashboard)/orders/[id]/+page.svelte` | Current page is a placeholder | Not individually rendered |
| `/pricing` | `(dashboard)/pricing/+page.svelte` | Current page is a placeholder | Not individually rendered |
| `/settings` | `(dashboard)/settings/+page.svelte` | Session and MFA security settings | Not individually rendered with an authenticated session |
| `/changePassword` | `(dashboard)/changePassword/+page.svelte` | Mandatory password change | Not individually rendered with an authenticated session |
| Dashboard error boundary | `(dashboard)/+error.svelte` | Role-aware error mapping | Not individually rendered with an authenticated session |

## Verification limits

- Build and Svelte diagnostics cover all discovered route modules, but they do not establish visual quality for every route.
- Authenticated screenshots require valid test identities for each role and permission profile. None were configured for this visual pass.
- The current placeholder pages listed above need backend-contract review before being designed as operational screens. They should not imply working actions or real data.
- `flutter` and `dart` are unavailable in the environment. No Flutter runtime screenshot was used; the public hero uses original illustration artwork.
- Browser screenshots in `screenshots/` are local production-preview captures. They do not prove behavior on a deployed domain or connected production APIs.
- The homepage was captured in light mode at the required width matrix and in dark mode at desktop and 390px mobile. Automated viewport checks found no horizontal document overflow.
- `/how-it-works` and `/for-procurers` were captured as full-page production screenshots on desktop and 390px mobile in light mode, plus desktop dark mode. Shared footer behavior was visible in these full-page captures.
- Public content now distinguishes active registration, verification, application and status flows from planned shopping, order, messaging, coverage and checkout capabilities. Legal pages list pending review topics without presenting them as approved policy.
- The web error catalog has 15+ state-specific treatments and 16 original SVG scene symbols. Tests check every current backend `ErrorCode` maps to a frontend catalog state, every referenced scene exists, and an injected Fastify error uses the same stable-code resolver. This is a contract test, not a database-backed authentication integration test.
- The production preview confirmed public pages render with the shared shell. Protected dashboard URLs redirect unauthenticated requests; role-authenticated visual review remains unavailable. The unknown-route response is HTTP 404 and uses the root error boundary.
