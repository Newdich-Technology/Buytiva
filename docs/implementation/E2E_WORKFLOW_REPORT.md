# End-to-end workflow report

`tests/integration/identity/procurerApplication.test.ts` covers selected application, verification, staff review, invitation, TOTP setup and activation. `tests/integration/procurerServices/servicesApi.test.ts` covers a separate fixture-created customer/procurer, profile, zone, pricing, address, list, request, quotation and order up to customer completion. It inserts a directly verified isolated test payment; it does not exercise payment provider verification or full onboarding. These separate flows are not the requested end-to-end journey.

Private review creation and owner retrieval were added to the separate procurement integration flow; public aggregates and the complete public-review/ratings journey remain absent. `tests/e2e/purchaseFlow.test.ts` now exercises real registration through private review, using a preauthenticated admin fixture and an isolated payment record; CI 45670541457 passed through private review and audited moderation. It is not the complete requested public-review/ratings workflow. Failure and concurrency paths remain incomplete. CI 45666580444 at `41bb5be` passed the private-review integration, including reversal/currency cases, with disposable PostgreSQL and isolated test payment. No staging or live-money test was performed.

CI 45671161336 also verified internal rating summary changes for pending, approved, hidden and reversed-payment states. Public presentation and real-provider verification remain absent.

CI 45682937911 also passed owner review editing, hidden and reversed-payment denial, concurrent edit fencing, audit persistence and stale moderator-version denial.
