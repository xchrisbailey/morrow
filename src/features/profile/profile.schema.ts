import { z } from "zod";

export const displayNameSchema = z.object({
  name: z.string().trim().min(1, "Enter a display name").max(50, "Use at most 50 characters"),
});
export type DisplayNameInput = z.infer<typeof displayNameSchema>;
