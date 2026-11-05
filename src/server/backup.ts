import { mkdirSync } from "node:fs";
import { join } from "node:path";
import type { Sqlite } from "./db.ts";

/**
 * Snapshots the database with `VACUUM INTO` (consistent, safe while the app
 * runs) to `<dir>/<prefix><timestamp>.db` and returns the path. Used by the
 * pre-migrate backup and by `node cli backup`.
 */
export function backupDatabase(sqlite: Sqlite, dir: string, prefix = ""): string {
  mkdirSync(dir, { recursive: true });
  const stamp = new Date().toISOString().replace(/[:.]/g, "-");
  const file = join(dir, `${prefix}${stamp}.db`);
  sqlite.prepare("VACUUM INTO ?").run(file);
  return file;
}
