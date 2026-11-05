import { timingSafeEqual } from "node:crypto";
import { count } from "drizzle-orm";
import type { Db } from "#/server/db.ts";
import { AppError } from "#/server/errors.ts";
import { user } from "#/server/schema.ts";

/** True once the Owner exists. An Instance has at most one user. */
export function hasOwner(db: Db): boolean {
  const [row] = db.select({ n: count() }).from(user).all();
  return (row?.n ?? 0) > 0;
}

function sameToken(expected: string, provided: string): boolean {
  const a = Buffer.from(expected);
  const b = Buffer.from(provided);
  return a.length === b.length && timingSafeEqual(a, b);
}

/**
 * The hard stop behind `databaseHooks.user.create.before`: creating a user is
 * allowed only while the Instance has no Owner and the caller holds the setup token.
 */
export function assertCanCreateOwner(
  db: Db,
  expectedToken: string | null,
  providedToken: string | null | undefined,
): void {
  if (hasOwner(db)) throw new AppError("FORBIDDEN", "This Instance already has an Owner.");
  if (!expectedToken || !providedToken || !sameToken(expectedToken, providedToken)) {
    throw new AppError("FORBIDDEN", "The setup token is wrong.", "token");
  }
}
