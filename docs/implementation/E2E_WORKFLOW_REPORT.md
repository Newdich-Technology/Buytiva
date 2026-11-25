# End-to-end workflow report

`tests/integration/identity/procurerApplication.test.ts` covers selected application, verification, staff review, invitation, TOTP setup and activation. `tests/integration/procurerServices/servicesApi.test.ts` covers a separate fixture-created customer/procurer, profile, zone, pricing, address, list, request, quotation and order up to customer completion. It inserts a directly verified isolated test payment; it does not exercise payment provider verification or full onboarding. These separate flows are not the requested end-to-end journey.

Reviews, moderation, aggregates and the integrated customer registration-to-review flow are absent. `tests/e2e/purchaseFlow.test.ts` is TODO and is not evidence. Failure and concurrency paths remain incomplete. Prior CI at `e52c4ed` passed existing tests using disposable PostgreSQL; new changes have not yet passed a PostgreSQL run. No staging or live-money test was performed.
