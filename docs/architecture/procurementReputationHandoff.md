# Procurement and reputation handoff (not implemented)

Authentication is not yet complete; this is a design handoff, not an implemented review API. Customer shopping lists exist on the current branch; address selection, procurer coverage and operating profiles, quotations, orders, order completion, disputes, refunds, notifications, ledger and payment settlement do not. The standalone pricing query uses a provisional threshold rule and is not an authoritative quote.

## Order and eligibility policy requiring product approval

Use an append-only transition history, role-specific authorization and atomic compare-and-set. An order starts from a customer-owned submitted list and eligible procurer/coverage snapshot. A proposed progression is submitted → accepted → in progress → delivered → completed; only customer confirmation or a separately approved timeout/dispute process may complete delivery. Neither a procurer action alone nor payment alone creates review eligibility. Cancellation, dispute and refund transitions require a policy matrix and must not erase financial history. Snapshot the assigned procurer, delivery address/zone, item prices, policy version and fees; recheck availability and coverage before assignment and quotation.

## Verified reviews and reputation

A review must reference one actual completed order, its owning active customer and assigned procurer. Enforce one review per order in the database and check ownership, verified completion, disputes and refund eligibility transactionally. The author and procurer must never be supplied as authoritative client IDs. Block self-review, unfinished orders, impostors, duplicate/concurrent submissions, and administrator impersonation. Product must decide edit-window length, refund/dispute handling, optional comments and whether responses are allowed.

A future review record needs order/customer/procurer foreign keys, integer rating 1–5, bounded untrusted comment, moderation state, timestamps and auditable revisions. Reports, moderation decisions and optional procurer responses require separate auditable records and granular permissions. Negative reviews cannot be removed merely for being negative. Serve text as text, not executable markup. Public averages and distributions derive only from eligible, publicly visible reviews; return a null average and “New procurer · No ratings yet” for zero reviews. Use a documented one-decimal rounding rule. Avoid independently editable averages; aggregation or caching must be transactionally consistent or reliably invalidated. Sorting by reputation should account for sample size and remain transparent while showing the simple average.

## Future contracts and tests

Define versioned, rate-limited endpoints for order-owned review creation/retrieval/edit, paginated public procurer reviews and rating summary, abuse reporting, optional procurer responses and permissioned audited moderation. Document auth, DTOs, errors, ordering and pagination. Database tests must assert ownership, unfinished/disputed/refunded orders, duplicate and concurrent submission, edits, removal/reinstatement, impersonation, abuse-report isolation and aggregate consistency. Do not register these endpoints or claim functionality before the completed-order policy and schema are verified.

## Dependencies and sequence

1. Finish and verify identity, privilege enforcement and safe schema deployment.
2. Implement procurer profiles, approved availability, delivery coverage and configurable pricing.
3. Connect customer lists to eligible procurers, quotation revisions, order creation and guarded completion.
4. Implement verified reviews and aggregate correctness, then moderation, notifications and reputation-aware discovery.
5. Design customer collections, reconciliation, funds release, pending/available earnings and payouts before enabling payment. Paystack virtual accounts are collection mechanisms, not automatic individual custody accounts. Provider account requirements and operational controls must be verified separately. No live transfers are enabled.

Frontend contracts must consume server-side eligibility, stable errors and pagination; the backend remains authoritative for roles, financial amounts and review eligibility. Define notification events and privacy/retention policies before enabling written feedback.
