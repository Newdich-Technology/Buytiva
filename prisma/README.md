# Database workflow

`schema.prisma` and `models/*.prisma` are the database contract. Prisma Client is the only database access path for the application; repositories contain queries and persistence operations.

Run `pnpm db:validate` to validate the schema, `pnpm db:generate` to generate the typed client, and `pnpm db:sync` to synchronize a database with the schema. Review the target database and take a verified backup before synchronizing any environment with existing data. The command does not create a checked-in SQL migration history.

Production schema changes require an explicit reviewed deployment procedure and a verified rollback or recovery plan. Do not run schema synchronization against production automatically at application startup.
