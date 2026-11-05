import { useForm } from "@tanstack/react-form";
import { useSuspenseQuery } from "@tanstack/react-query";
import { describedBy, Field } from "#/components/field.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { toast } from "#/components/ui/toast.tsx";
import { fieldProps, formValidationLogic, handleSubmitError } from "#/lib/forms.ts";
import { displayNameSchema } from "../profile.schema.ts";
import { useUpdateDisplayName, viewerQueryOptions } from "../profile.queries.ts";

export function DisplayNameForm() {
  const { data: viewer } = useSuspenseQuery(viewerQueryOptions());
  const update = useUpdateDisplayName();

  const form = useForm({
    defaultValues: { name: viewer.name },
    // One Zod schema: here on blur and submit, and in the server function's inputValidator.
    validationLogic: formValidationLogic,
    validators: { onSubmit: displayNameSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        const saved = await update.mutateAsync(value);
        formApi.reset({ name: saved.name });
        toast.add({ type: "success", title: "Display name saved" });
      } catch (error) {
        handleSubmitError(error, (field, message) => {
          if (field !== "name") return false;
          formApi.setFieldMeta("name", (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: message },
          }));
          return true;
        });
      }
    },
  });

  return (
    <form
      noValidate
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      <form.Field name="name" {...fieldProps(displayNameSchema.shape.name)}>
        {(field) => {
          const error = field.state.meta.errors
            .map((e) => (typeof e === "string" ? e : e?.message))
            .find(Boolean);
          return (
            <Field id="display-name" label="Display name" error={error} className="max-w-[24rem]">
              <Input
                id="display-name"
                name="name"
                autoComplete="name"
                value={field.state.value}
                aria-invalid={error ? true : undefined}
                aria-describedby={describedBy("display-name", error)}
                onBlur={field.handleBlur}
                onChange={(e) => field.handleChange(e.target.value)}
              />
            </Field>
          );
        }}
      </form.Field>
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(submitting) => (
          <div>
            <Button type="submit" disabled={submitting}>
              Save
            </Button>
          </div>
        )}
      </form.Subscribe>
    </form>
  );
}
