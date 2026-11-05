import { eq } from "drizzle-orm";
import type { Db } from "#/server/db.ts";
import { AppError } from "#/server/errors.ts";
import { user } from "#/server/schema.ts";
import type { DisplayNameInput } from "./profile.schema.ts";

export type Viewer = { id: string; email: string; name: string };

export function getViewer(db: Db, userId: string): Viewer {
  const [row] = db
    .select({ id: user.id, email: user.email, name: user.name })
    .from(user)
    .where(eq(user.id, userId))
    .all();
  if (!row) throw new AppError("NOT_FOUND", "Account not found.");
  return row;
}

export function updateDisplayName(db: Db, userId: string, input: DisplayNameInput): Viewer {
  const name = input.name.trim();
  if (!name) throw new AppError("VALIDATION", "Enter a display name", "name");
  const [row] = db
    .update(user)
    .set({ name, updatedAt: new Date() })
    .where(eq(user.id, userId))
    .returning({ id: user.id, email: user.email, name: user.name })
    .all();
  if (!row) throw new AppError("NOT_FOUND", "Account not found.");
  return row;
}
