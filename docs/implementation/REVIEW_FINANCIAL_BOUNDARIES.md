# Financial and reputation boundaries (interim, not approved policy)

Public reviews and ratings remain disabled. This document describes what the current implementation does, not provider integration or a final product decision.

| Event | Current enforcement | Remaining decision or engineering |
|---|---|---|
| Payment reversed | New review and edit require a non-reversed, non-future matching verified payment; internal eligible aggregate excludes the review. Owner can still read their private review. | No provider reversal writer or public propagation; integrate verified events and test ordering/replays. |
| Refund pending, completed or partial | No refund model, event ingestion or refund state exists; no claimed visibility rule is enforced. | Product, financial and legal owners must approve treatment of each case; implement state machine and conservative visibility before any public reputation release. |
| Dispute opened/resolved | Order transitions can place an eligible order in `DISPUTED`; review admission and internal aggregation require `COMPLETED`. There is no dispute-resolution workflow. | Define resolution, refund handling, recovery, appeal and visibility; test transitions under concurrency. |
| Order cancelled | Admission and internal aggregation require `COMPLETED`; cancellation is a separate order state. | Cancellation/refund terms and real provider events remain unimplemented. |
| Customer requests removal | Customer can submit a private report concerning their own review; decisions do not automatically remove it. | A removal workflow, retention, erasure, audit, appeals and privacy obligations require policy and implementation. |
| Moderator hides/reinstates | Explicit staff permission, recent MFA, reason, version and audit are required. Hidden/pending reviews are excluded from internal aggregate. Reinstatement is subject to payment/completion eligibility. | Policy, review history presentation, appeals and controls preventing improper suppression need more tests and review. |

No report, rating, order or isolated test fixture proves that money was received. No public payment writer or live payout is enabled. Never infer that partial refunds mean full payment reversal, or assume a provider collection account provides custody. Until a supported model represents these events and product approves policy, do not expose a customer-facing aggregate.
