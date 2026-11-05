import { randomBytes } from "node:crypto";
import { hasOwner } from "#/features/auth/auth.server.ts";
import type { Db } from "./db.ts";
import { baseUrl } from "./env.ts";

// On globalThis so the startup plugin and the app bundle see the same token.
const KEY = Symbol.for("morrow.setupToken");
const store = globalThis as unknown as Record<symbol, string | null | undefined>;

/** The token that allows creating the Owner, or null once an Owner exists. */
export function getSetupToken(): string | null {
  return store[KEY] ?? null;
}

/**
 * On start with zero users: use `MORROW_SETUP_TOKEN` or generate one, and log it.
 * With an Owner present there is no token.
 */
export function initSetupToken(
  db: Db,
  env: NodeJS.ProcessEnv = process.env,
  log: (msg: string) => void = console.log,
): string | null {
  if (hasOwner(db)) {
    store[KEY] = null;
    return null;
  }
  const token = env.MORROW_SETUP_TOKEN || randomBytes(18).toString("base64url");
  store[KEY] = token;
  const url = baseUrl(env);
  log(
    ["", "  No Owner yet. Create one at:", `    ${url}/setup`, `  Setup token: ${token}`, ""].join(
      "\n",
    ),
  );
  return token;
}
