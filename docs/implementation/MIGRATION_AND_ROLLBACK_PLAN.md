# Migration and rollback proposal — not approved

The current schema is tested with Prisma `db push` only against disposable CI PostgreSQL. It is not a production migration, does not establish an upgrade path from a deployed schema, and must never be used for production synchronization. No production database was touched. The repository requires no handwritten SQL files; Prisma Migrate normally produces SQL migration artifacts. Whether generated, reviewed artifacts are permitted must be agreed by the project owner and deployment/security reviewers before rollout. Until then, production migration is blocked, not silently waived.

## Proposed release gates

1. Inventory the deployed database, server version, schema, migration history, data volumes, dependencies, permissions and application versions; compare against the Prisma schema without applying changes. Establish a baseline and record discrepancies. Obtain independent database and security review.
2. Agree on a versioned, non-handwritten migration artifact workflow and approval controls. Review all generated statements for destructive changes, backfills, lock duration, indexes, constraints, defaults and compatible mixed-version operation. No unreviewed destructive change or implicit data loss.
3. Take an encrypted, access-controlled backup and verify point-in-time recovery by restoring to a separate isolated instance. Define RPO/RTO, maintenance window, rollback decision authority, and escalation contacts.
4. Rehearse against a sanitized production-scale clone with application versions, representative data and concurrent traffic. Validate constraints, query plans, index build behavior, latency, compatibility and checksums. Test failure halfway through and recover. Record deployment timings and evidence.
5. Prefer expand/backfill/verify/contract changes across separate releases: add backward-compatible nullable/defaulted fields first, migrate data in bounded observable jobs, validate constraints, switch reads/writes, then remove legacy schema only after a safe observation window. Schema locks and DDL safety require database-owner review.
6. Deploy with least privilege, a reviewed immutable artifact, release lock, health checks and monitoring; stop on failed preconditions or degraded metrics. Keep live money and payouts off.

## Rollback

Application rollback is safe only while the prior version remains schema-compatible. A data-changing deployment cannot assume that reversing DDL recovers data. Prefer a tested forward fix; if necessary restore from the verified backup/PITR to a separate instance and reconcile all writes/events since the recovery point under an approved incident procedure before any cutover. Record data loss window and audit trails. Do not restore over production or execute destructive commands without explicit operational authorization. Review reports and their snapshots may contain personal data; retention, access, erasure and backup policies need legal/privacy approval.
