import { sql } from "drizzle-orm";
import { resolve } from "node:path";
import { createDb, openSqlite } from "./db.ts";
import { runMigrations } from "./migrate.ts";

export const migrationsFolder = resolve(import.meta.dirname, "../../drizzle");

/** A fresh in-memory database with the real migrations applied. For tests. */
export function createTestDb() {
  const sqlite = openSqlite(":memory:");
  const db = createDb(sqlite);
  runMigrations(sqlite, db, { migrationsFolder });
  return { sqlite, db };
}

export function insertUser(db: ReturnType<typeof createDb>, id = "u1", name = "Ada") {
  db.run(sql`INSERT INTO user (id, name, email) VALUES (${id}, ${name}, ${`${id}@example.com`})`);
  return id;
}
