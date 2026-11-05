import { z } from "zod";

const email = z.string().trim().min(1, "Enter your email").pipe(z.email("Enter a valid email"));
const password = z
  .string()
  .min(8, "Use at least 8 characters")
  .max(128, "Use at most 128 characters");

export const setupSchema = z.object({
  token: z.string().trim().min(1, "Enter the setup token"),
  name: z.string().trim().min(1, "Enter a display name").max(50, "Use at most 50 characters"),
  email,
  password,
});
export type SetupInput = z.infer<typeof setupSchema>;

export const signInSchema = z.object({
  email,
  // Any length here: only the server decides if it's right.
  password: z.string().min(1, "Enter your password"),
});
export type SignInInput = z.infer<typeof signInSchema>;
