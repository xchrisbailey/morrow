import { drizzleAdapter } from "@better-auth/drizzle-adapter";
import { betterAuth, type BetterAuthPlugin } from "better-auth";
import { APIError } from "better-auth/api";
import { assertCanCreateOwner } from "#/features/auth/auth.server.ts";
import type { Db } from "./db.ts";
import { AppError } from "./errors.ts";
import * as schema from "./schema.ts";

/** The header the setup flow uses to present the token to the user-create hook. */
export const SETUP_TOKEN_HEADER = "x-setup-token";

type Options = {
  db: Db;
  baseURL: string;
  secret: string;
  /** Returns the token a new Owner must present (null when none is allowed). */
  setupToken: () => string | null;
  /** Extra plugins; the app adds `tanstackStartCookies()` (kept out of here so the CLI can bundle this file). */
  plugins?: BetterAuthPlugin[];
};

export function createAuth({ db, baseURL, secret, setupToken, plugins = [] }: Options) {
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
    plugins,
  });
}

export type Auth = ReturnType<typeof createAuth>;
