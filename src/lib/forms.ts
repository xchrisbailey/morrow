import { revalidateLogic } from "@tanstack/react-form";
import type { ZodType } from "zod";
import { toAppError } from "#/server/errors.ts";
import { toast } from "#/components/ui/toast.tsx";

type FieldErrorSetter = (field: string, message: string) => boolean;

/**
 * Submit-handler error mapping: an AppError with a `field` the form knows lands on
 * that field; everything else becomes a toast. `setFieldError` returns false for an unknown field.
 */
export function handleSubmitError(error: unknown, setFieldError: FieldErrorSetter): void {
  const app = toAppError(error);
  if (app.field && setFieldError(app.field, app.message)) return;
  toast.add({ type: "error", title: app.message });
}

/**
 * `validationLogic` for every form: validate a field on blur, then on submit, and
 * live once a submit has been tried. Pair it with `fieldValidators`.
 */
export const formValidationLogic = revalidateLogic({ mode: "blur", modeAfterSubmission: "change" });

/**
 * Props for a `form.Field` from one property of a shared Zod object schema.
 * Validates on blur and submit; while a field shows an error, it re-checks as the
 * person types, so a fix clears the error (a stale one would block Enter).
 */
export function fieldProps(schema: ZodType) {
  return {
    validators: {
      onDynamic: ({ value }: { value: unknown }): string | undefined => {
        const result = schema.safeParse(value);
        return result.success ? undefined : result.error.issues[0]?.message;
      },
    },
    listeners: {
      onChange: ({
        fieldApi,
      }: {
        fieldApi: { state: { meta: { errors: unknown[] } }; validate: (cause: "blur") => unknown };
      }) => {
        if (fieldApi.state.meta.errors.length > 0) void fieldApi.validate("blur");
      },
    },
  };
}
