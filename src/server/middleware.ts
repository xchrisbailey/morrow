import { createMiddleware } from "@tanstack/react-start";
import { getRequestHeaders } from "@tanstack/react-start/server";
import { getAuth } from "./auth.ts";
import { AppError } from "./errors.ts";

/**
 * Put this on every data server function. It rejects without a session and puts
 * `user` in context. Route `beforeLoad` redirects are navigation, not the boundary.
 */
export const authed = createMiddleware({ type: "function" }).server(async ({ next }) => {
  const session = await getAuth().api.getSession({ headers: getRequestHeaders() });
  if (!session) throw new AppError("UNAUTHORIZED", "Sign in to continue.");
  return next({ context: { user: session.user } });
});
