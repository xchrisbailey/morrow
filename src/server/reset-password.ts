import { asc } from "drizzle-orm";
import type { Auth } from "./auth.ts";
import type { Db } from "./db.ts";
import { AppError } from "./errors.ts";
import { user } from "./schema.ts";

/**
 * Sets the Owner's password through better-auth and revokes every session.
 * For `node cli reset-password` (issue #25). Returns the Owner's email.
 */
export async function resetOwnerPassword(auth: Auth, db: Db, newPassword: string): Promise<string> {
  const [owner] = db.select().from(user).orderBy(asc(user.createdAt)).limit(1).all();
  if (!owner) throw new AppError("NOT_FOUND", "This Instance has no Owner yet.");
  if (newPassword.length < 8)
    throw new AppError("VALIDATION", "Password must be at least 8 characters.", "password");
  const ctx = await auth.$context;
  const hash = await ctx.password.hash(newPassword);
  await ctx.internalAdapter.updatePassword(owner.id, hash);
  await ctx.internalAdapter.deleteUserSessions(owner.id);
  return owner.email;
}
