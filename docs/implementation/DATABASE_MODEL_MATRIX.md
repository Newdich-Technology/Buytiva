# Database model matrix

Schema sources live under `prisma/models/`. This matrix summarizes model families, not a completed individual index/performance audit. CI `db:sync` uses an isolated database, not reviewed migrations. No production data was changed.

| Schema | Main persisted records / constraints | Status / gaps |
|---|---|---|
| `user.prisma`, `authCredentials.prisma`, `passwordReset.prisma` | users, credentials, sessions, challenges, reset tokens, role assignments | implemented; inspect all lifecycle constraints before rollout |
| `procurerApplications.prisma`, `identityAccess.prisma`, `auditLog.prisma`, `outboxEvent.prisma` | applications, invitation/profile/permissions, audit and outbox | implemented; delivery is at-least-once; retention and audits incomplete |
| `address.prisma`, `deliveryZone.prisma`, `pricingPolicy.prisma` | addresses, procurer zones, pricing versions | implemented; standardized location registry and preferred address missing |
| `shoppingList.prisma`, `quotation.prisma` | lists/items, request snapshots, revisioned quotations | implemented; lifecycle/race tests incomplete |
| `order.prisma`, `payment.prisma` | unique order per quote/request, history, one matching verified-payment record | initial implementation; no verified provider writer or refund model |
| `admin.prisma`, `appSetting.prisma`, `attachment.prisma`, `authSession.prisma`, `backgroundJob.prisma`, `conversation.prisma`, `idempotencyKey.prisma`, `message.prisma`, `notification.prisma`, `refund.prisma` | empty files | scaffolds only; some related concepts live in other files, file names are not proof of feature coverage |
| reviews / ratings | no model | missing |

Prisma relation constraints and serializable transactions provide some integrity, not complete production performance, migration, refund or financial safety. Full model-by-model and query-plan review remains open.
