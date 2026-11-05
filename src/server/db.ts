import { mkdirSync } from "node:fs";
import { join } from "node:path";
import Database from "better-sqlite3";
import { drizzle, type BetterSQLite3Database } from "drizzle-orm/better-sqlite3";
import { dataDir } from "./env.ts";
import { relations } from "./relations.ts";

export type Db = BetterSQLite3Database<typeof relations>;
export type Sqlite = Database.Database;

/** Opens a SQLite file (or `:memory:`) with morrow's pragmas. */
export function openSqlite(file: string): Sqlite {
  const sqlite = new Database(file);
  sqlite.pragma("journal_mode = WAL");
  sqlite.pragma("foreign_keys = ON");
  return sqlite;
}

export function createDb(sqlite: Sqlite): Db {
  return drizzle({ client: sqlite, relations });
}

export function dbPath(dir = dataDir()): string {
  return join(dir, "morrow.db");
}

type Shared = { sqlite: Sqlite; db: Db };
// On globalThis so the nitro startup plugin and the app bundle share one handle.
const KEY = Symbol.for("morrow.db");
const store = globalThis as unknown as Record<symbol, Shared | undefined>;

/** The one shared handle, opened on first use. Serves the app and better-auth. */
export function getDatabase(): Shared {
  let shared = store[KEY];
  if (!shared) {
    const dir = dataDir();
    mkdirSync(dir, { recursive: true });
    const sqlite = openSqlite(dbPath(dir));
    shared = { sqlite, db: createDb(sqlite) };
    store[KEY] = shared;
  }
  return shared;
}
