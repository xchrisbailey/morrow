import { join } from "node:path";
import { migrate } from "drizzle-orm/better-sqlite3/migrator";
import { readMigrationFiles } from "drizzle-orm/migrator";
import { backupDatabase } from "./backup.ts";
import type { Db, Sqlite } from "./db.ts";

type Options = { migrationsFolder: string; backupsDir?: string; log?: (msg: string) => void };

/** Migrations on disk that the database has not applied yet. */
export function pendingMigrations(sqlite: Sqlite, migrationsFolder: string): string[] {
  const files = readMigrationFiles({ migrationsFolder });
  const table = sqlite
    .prepare("SELECT name FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'")
    .get();
  const applied = new Set(
    table
      ? (sqlite.prepare("SELECT hash FROM __drizzle_migrations").all() as { hash: string }[]).map(
          (r) => r.hash,
        )
      : [],
  );
  return files.filter((m) => !applied.has(m.hash)).map((m) => m.name);
}

/**
 * Applies pending migrations. If the database already has data and something is
 * pending, it first snapshots to `<backupsDir>/pre-migrate-<ts>.db`. Returns the
 * names applied.
 */
export function runMigrations(sqlite: Sqlite, db: Db, options: Options): string[] {
  const pending = pendingMigrations(sqlite, options.migrationsFolder);
  if (pending.length === 0) return [];
  const initialised = Boolean(
    sqlite
      .prepare("SELECT 1 FROM sqlite_master WHERE type='table' AND name='__drizzle_migrations'")
      .get(),
  );
  if (options.backupsDir && initialised) {
    const file = backupDatabase(sqlite, options.backupsDir, "pre-migrate-");
    options.log?.(`Backed up database to ${file} before migrating`);
  }
  migrate(db, { migrationsFolder: options.migrationsFolder });
  options.log?.(`Applied ${pending.length} migration(s): ${pending.join(", ")}`);
  return pending;
}

export const backupsDirFor = (dataDir: string) => join(dataDir, "backups");
