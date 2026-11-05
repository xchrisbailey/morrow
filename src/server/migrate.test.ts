import { cpSync, mkdirSync, mkdtempSync, readdirSync, writeFileSync } from "node:fs";
import { tmpdir } from "node:os";
import { join } from "node:path";
import { describe, expect, it } from "vite-plus/test";
import { createDb, openSqlite } from "./db.ts";
import { pendingMigrations, runMigrations } from "./migrate.ts";
import { migrationsFolder } from "./test-db.ts";

describe("runMigrations", () => {
  it("applies all migrations to a fresh database without a backup", () => {
    const sqlite = openSqlite(":memory:");
    const dir = mkdtempSync(join(tmpdir(), "morrow-"));
    const applied = runMigrations(sqlite, createDb(sqlite), { migrationsFolder, backupsDir: dir });
    expect(applied.length).toBeGreaterThan(0);
    expect(pendingMigrations(sqlite, migrationsFolder)).toEqual([]);
    expect(readdirSync(dir)).toEqual([]);
  });

  it("backs up with VACUUM INTO when migrations are pending on an existing database", () => {
    const dir = mkdtempSync(join(tmpdir(), "morrow-"));
    const sqlite = openSqlite(join(dir, "morrow.db"));
    const db = createDb(sqlite);
    runMigrations(sqlite, db, { migrationsFolder });
    // A later release adds a migration.
    const next = join(dir, "migrations");
    cpSync(migrationsFolder, next, { recursive: true });
    mkdirSync(join(next, "29991231000000_extra"));
    writeFileSync(
      join(next, "29991231000000_extra", "migration.sql"),
      "CREATE TABLE extra (id integer);",
    );
    const applied = runMigrations(sqlite, db, {
      migrationsFolder: next,
      backupsDir: join(dir, "backups"),
    });
    expect(applied).toEqual(["29991231000000_extra"]);
    const backups = readdirSync(join(dir, "backups"));
    expect(backups).toHaveLength(1);
    expect(backups[0]).toMatch(/^pre-migrate-.*\.db$/);
  });

  it("does nothing when up to date", () => {
    const sqlite = openSqlite(":memory:");
    const db = createDb(sqlite);
    runMigrations(sqlite, db, { migrationsFolder });
    expect(runMigrations(sqlite, db, { migrationsFolder })).toEqual([]);
  });
});
