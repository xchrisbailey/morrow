import { useForm } from "@tanstack/react-form";
import { useMutation } from "@tanstack/react-query";
import { useRouter } from "@tanstack/react-router";
import { describedBy, Field } from "#/components/field.tsx";
import { Button } from "#/components/ui/button.tsx";
import { Input } from "#/components/ui/input.tsx";
import { fieldProps, formValidationLogic, handleSubmitError } from "#/lib/forms.ts";
import { signInFn } from "../auth.functions.ts";
import { signInSchema, type SignInInput } from "../auth.schema.ts";

export function SignInForm() {
  const router = useRouter();
  const signIn = useMutation({ mutationFn: (input: SignInInput) => signInFn({ data: input }) });

  const form = useForm({
    defaultValues: { email: "", password: "" } as SignInInput,
    validationLogic: formValidationLogic,
    validators: { onSubmit: signInSchema },
    onSubmit: async ({ value, formApi }) => {
      try {
        await signIn.mutateAsync(value);
        await router.navigate({ to: "/" });
      } catch (error) {
        handleSubmitError(error, (field, message) => {
          if (!(field in value)) return false;
          formApi.setFieldMeta(field as keyof SignInInput, (meta) => ({
            ...meta,
            errorMap: { ...meta.errorMap, onSubmit: message },
          }));
          return true;
        });
      }
    },
  });

  const fields = [
    { name: "email", label: "Email", type: "email", autoComplete: "email" },
    { name: "password", label: "Password", type: "password", autoComplete: "current-password" },
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
        <form.Field key={f.name} name={f.name} {...fieldProps(signInSchema.shape[f.name])}>
          {(field) => {
            const error = field.state.meta.errors
              .map((e) => (typeof e === "string" ? e : e?.message))
              .find(Boolean);
            return (
              <Field id={`signin-${f.name}`} label={f.label} error={error}>
                <Input
                  id={`signin-${f.name}`}
                  name={f.name}
                  type={f.type}
                  autoComplete={f.autoComplete}
                  value={field.state.value}
                  aria-invalid={error ? true : undefined}
                  aria-describedby={describedBy(`signin-${f.name}`, error)}
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
            Sign in
          </Button>
        )}
      </form.Subscribe>
    </form>
  );
}
