import { eq } from "drizzle-orm";
import type { Db } from "#/server/db.ts";
import { scratchpad } from "#/server/schema.ts";
import type { SaveScratchpadInput, Scratchpad } from "./scratchpad.schema.ts";

/** The Owner's Scratchpad; an empty one if nothing is saved yet. */
export function getScratchpad(db: Db, userId: string): Scratchpad {
  const [row] = db.select().from(scratchpad).where(eq(scratchpad.userId, userId)).all();
  if (!row) return { content: [], updatedAt: null };
  return {
    content: row.content as Scratchpad["content"],
    updatedAt: row.updatedAt.getTime(),
  };
}

/** Creates or replaces the Scratchpad (one per user). */
export function saveScratchpad(db: Db, userId: string, input: SaveScratchpadInput): Scratchpad {
  const now = new Date();
  db.insert(scratchpad)
    .values({ userId, content: input.content, updatedAt: now })
    .onConflictDoUpdate({
      target: scratchpad.userId,
      set: { content: input.content, updatedAt: now },
    })
    .run();
  return { content: input.content, updatedAt: now.getTime() };
}
