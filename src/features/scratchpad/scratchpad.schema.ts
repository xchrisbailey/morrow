import { z } from "zod";

export type Json = string | number | boolean | null | Json[] | { [key: string]: Json };
/** One BlockNote block: `{ id, type, props, content, children }`. */
export type Block = { id: string; type: string; [key: string]: Json };

/** BlockNote's block array. Only the envelope is checked; the editor owns the rest. */
export const blockSchema = z.looseObject({
  id: z.string(),
  type: z.string(),
}) as unknown as z.ZodType<Block>;

export const saveScratchpadSchema = z.object({
  content: z.array(blockSchema).max(5000, "The Scratchpad is too long"),
});
export type SaveScratchpadInput = z.infer<typeof saveScratchpadSchema>;
export type Scratchpad = { content: Block[]; updatedAt: number | null };
