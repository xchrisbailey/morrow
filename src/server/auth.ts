import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth } from "better-auth";
import { APIError } from "better-auth/api";
import { tanstackStartCookies } from "better-auth/tanstack-start";
import { assertCanCreateOwner } from "#/features/auth/auth.server.ts";
import { type Db, getDatabase } from "./db.ts";
import { authSecret, baseUrl, dataDir } from "./env.ts";
import { AppError } from "./errors.ts";
import * as schema from "./schema.ts";
import { getSetupToken } from "./setup-token.ts";

/** The header the setup flow uses to present the token to the user-create hook. */
export const SETUP_TOKEN_HEADER = "x-setup-token";

type Options = {
  db: Db;
  baseURL: string;
  secret: string;
  /** Returns the token a new Owner must present (null when none is allowed). */
  setupToken: () => string | null;
};

export function createAuth({ db, baseURL, secret, setupToken }: Options) {
  return betterAuth({
    baseURL,
    secret,
    database: drizzleAdapter(db, { provider: "sqlite", schema }),
    emailAndPassword: { enabled: true, requireEmailVerification: false },
    // 30 days, refreshed on use (at most once a day).
    session: { expiresIn: 60 * 60 * 24 * 30, updateAge: 60 * 60 * 24 },
    // Secure cookies only over https, so a plain-http Instance still signs in.
    advanced: { useSecureCookies: baseURL.startsWith("https://") },
    databaseHooks: {
      user: {
        create: {
          before: async (_user, context) => {
            try {
              assertCanCreateOwner(db, setupToken(), context?.headers?.get(SETUP_TOKEN_HEADER));
            } catch (error) {
              if (error instanceof AppError) {
                throw new APIError("FORBIDDEN", { message: error.userMessage });
              }
              throw error;
            }
          },
        },
      },
    },
    // Must stay last.
    plugins: [tanstackStartCookies()],
  });
}

export type Auth = ReturnType<typeof createAuth>;

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
    });
    store[KEY] = auth;
  }
  return auth;
}
