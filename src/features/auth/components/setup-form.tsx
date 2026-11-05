import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { describedBy, Field } from "#/components/field.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { fieldProps, formValidationLogic, handleSubmitError } from "#/lib/forms.ts";
import { setupOwnerFn } from "../auth.functions.ts";
import { setupSchema, type SetupInput } from "../auth.schema.ts";

export function SetupForm() {
  const router = useRouter();
  const setup = useMutation({ mutationFn: (input: SetupInput) => setupOwnerFn({ data: input }) });

  const form = useForm({
    defaultValues: { token: "", name: "", email: "", password: "" } as SetupInput,
    validationLogic: formValidationLogic,
    validators: { onSubmit: setupSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await setup.mutateAsync(value);
        await router.navigate({ to: "/" });
      } catch (error) {
        handleSubmitError(error, (field, message) => {
          if (!(field in value)) return false;
          formApi.setFieldMeta(field as keyof SetupInput, (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: message },
          }));
          return true;
        });
      }
    },
  });

  const fields = [
    { name: "token", label: "Setup token", type: "text", autoComplete: "off" },
    { name: "name", label: "Display name", type: "text", autoComplete: "name" },
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "password", label: "Password", type: "password", autoComplete: "new-password" },
  ] as const;

  return (
    <form
      noValidate
      className="stack"
      onSubmit={(event) => {
        event.preventDefault();
        void form.handleSubmit();
      }}
    >
      {fields.map((f) => (
        <form.Field key={f.name} name={f.name} {...fieldProps(setupSchema.shape[f.name])}>
          {(field) => {
            const error = field.state.meta.errors
              .map((e) => (typeof e === "string" ? e : e?.message))
              .find(Boolean);
            return (
              <Field id={`setup-${f.name}`} label={f.label} error={error}>
                <Input
                  id={`setup-${f.name}`}
                  name={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  value={field.state.value}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy(`setup-${f.name}`, error)}
                  onBlur={field.handleBlur}
                  onChange={(e) => field.handleChange(e.target.value)}
                />
              </Field>
            );
          }}
        </form.Field>
      ))}
      <form.Subscribe selector={(s) => s.isSubmitting}>
        {(submitting) => (
          <Button type="submit" disabled={submitting}>
            Create Owner
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
