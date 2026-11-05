import { randomBytes } from "node:crypto";
import { chmodSync, existsSync, mkdirSync, readFileSync, writeFileSync } from "node:fs";
import { join, resolve } from "node:path";

/** `$MORROW_DATA_DIR`, default `./data` (the Docker image sets `/data`). */
export function dataDir(env: NodeJS.ProcessEnv = process.env): string {
  return resolve(env.MORROW_DATA_DIR || "./data");
}

/** Migrations folder: `$MIGRATIONS_DIR`, default `./drizzle` relative to cwd. */
export function migrationsDir(env: NodeJS.ProcessEnv = process.env): string {
  return resolve(env.MIGRATIONS_DIR || "./drizzle");
}

/** The public URL. Required in production; defaults to the dev server. */
export function baseUrl(env: NodeJS.ProcessEnv = process.env): string {
  const url = env.MORROW_URL || "http://localhost:3000";
  return url.replace(/\/+$/, "");
}

/** `$MORROW_SECRET`, or a secret generated once and kept in `$MORROW_DATA_DIR/secret`. */
export function authSecret(dir: string, env: NodeJS.ProcessEnv = process.env): string {
  if (env.MORROW_SECRET) return env.MORROW_SECRET;
  const file = join(dir, "secret");
  if (existsSync(file)) return readFileSync(file, "utf8").trim();
  mkdirSync(dir, { recursive: true });
  const secret = randomBytes(32).toString("base64url");
  writeFileSync(file, secret, { mode: 0o600 });
  chmodSync(file, 0o600);
  return secret;
}
