import { createServerFn } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { APIError } from "better-auth/api";
import { getAuth, SETUP_TOKEN_HEADER } from "#/server/auth.ts";
import { getDatabase } from "#/server/db.ts";
import { AppError, zodValidator } from "#/server/errors.ts";
import { getSetupToken } from "#/server/setup-token.ts";
import { assertCanCreateOwner, hasOwner } from "./auth.server.ts";
import { setupSchema, signInSchema } from "./auth.schema.ts";

// Public on purpose (no `authed`): setup, sign-in and the two lookups the
// redirects need. Every data function elsewhere uses the `authed` middleware.

export const hasOwnerFn = createServerFn({ method: "GET" }).handler(() =>
  hasOwner(getDatabase().db),
);

/** The signed-in user or null. For route redirects only; it is not a data boundary. */
export const getSessionUserFn = createServerFn({ method: "GET" }).handler(async () => {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  return session
    ? { id: session.user.id, email: session.user.email, name: session.user.name }
    : null;
});

export const setupOwnerFn = createServerFn({ method: "POST" })
  .validator(zodValidator(setupSchema))
  .handler(async ({ data }) => {
    assertCanCreateOwner(getDatabase().db, getSetupToken(), data.token);
    try {
      await getAuth().api.signUpEmail({
        body: { name: data.name, email: data.email, password: data.password },
        headers: new Headers({ [SETUP_TOKEN_HEADER]: data.token }),
      });
    } catch (error) {
      if (error instanceof APIError) throw new AppError("FORBIDDEN", error.message);
      throw error;
    }
    return { ok: true as const };
  });

export const signInFn = createServerFn({ method: "POST" })
  .validator(zodValidator(signInSchema))
  .handler(async ({ data }) => {
    try {
      await getAuth().api.signInEmail({ body: data });
    } catch (error) {
      if (error instanceof APIError) {
        throw new AppError("UNAUTHORIZED", "Wrong email or password.", "password");
      }
      throw error;
    }
    return { ok: true as const };
  });

export const signOutFn = createServerFn({ method: "POST" }).handler(async () => {
  await getAuth().api.signOut({ headers: getRequestHeaders() });
  return { ok: true as const };
});
