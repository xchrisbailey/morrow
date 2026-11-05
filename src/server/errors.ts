import type { ZodType } from "zod";

export type AppErrorCode =
  | "UNAUTHORIZED"
  | "FORBIDDEN"
  | "VALIDATION"
  | "NOT_FOUND"
  | "CONFLICT"
  | "INTERNAL";

export type AppErrorShape = { code: AppErrorCode; message: string; field?: string };

/**
 * The one error the UI knows how to show. Throw it from `*.server.ts` functions
 * and middleware. It crosses the server function boundary as JSON in the message
 * (see `toAppError`), so it survives serialisation whatever the transport does
 * to Error subclasses. An error with a `field` belongs to that form field;
 * anything else is shown as a toast.
 */
export class AppError extends Error {
  readonly code: AppErrorCode;
  readonly field?: string;

  constructor(code: AppErrorCode, message: string, field?: string) {
    super(JSON.stringify({ code, message, field } satisfies AppErrorShape));
    this.name = "AppError";
    this.code = code;
    this.field = field;
  }

  toJSON(): AppErrorShape {
    return { code: this.code, message: this.userMessage, field: this.field };
  }

  get userMessage(): string {
    return (JSON.parse(this.message) as AppErrorShape).message;
  }
}

/** Turns anything thrown (including an AppError that crossed the wire) into an AppErrorShape. */
export function toAppError(error: unknown): AppErrorShape {
  if (error instanceof AppError) return error.toJSON();
  if (error instanceof Error) {
    try {
      const parsed = JSON.parse(error.message) as Partial<AppErrorShape>;
      if (parsed && typeof parsed.code === "string" && typeof parsed.message === "string") {
        return { code: parsed.code, message: parsed.message, field: parsed.field };
      }
    } catch {
      // Not one of ours.
    }
  }
  return { code: "INTERNAL", message: "Something went wrong. Try again." };
}

/**
 * `.validator()` adapter: runs a Zod schema and throws an AppError naming
 * the first failing field, so the form can show the server's message in place.
 */
export function zodValidator<T>(schema: ZodType<T>) {
  return (input: unknown): T => {
    const result = schema.safeParse(input);
    if (result.success) return result.data;
    const issue = result.error.issues[0];
    const field = issue?.path.length ? String(issue.path[0]) : undefined;
    throw new AppError("VALIDATION", issue?.message ?? "Invalid input", field);
  };
}
