import { tanstackStartCookies } from "better-auth/tanstack-start";
import { type Auth, createAuth } from "./create-auth.ts";
import { getDatabase } from "./db.ts";
import { authSecret, baseUrl, dataDir } from "./env.ts";
import { getSetupToken } from "./setup-token.ts";

export { type Auth, createAuth, SETUP_TOKEN_HEADER } from "./create-auth.ts";

const KEY = Symbol.for("morrow.auth");
const store = globalThis as unknown as Record<symbol, Auth | undefined>;

/** The Instance's auth, built on first use over the shared database. */
export function getAuth(): Auth {
  let auth = store[KEY];
  if (!auth) {
    auth = createAuth({
      db: getDatabase().db,
      baseURL: baseUrl(),
      secret: authSecret(dataDir()),
      setupToken: getSetupToken,
      // Must stay last.
      plugins: [tanstackStartCookies()],
    });
    store[KEY] = auth;
  }
  return auth;
}
