import { createFileRoute, redirect } from "@tanstack/react-router";
import { getSessionUserFn, hasOwnerFn } from "#/features/auth/auth.functions.ts";
import { SignInForm } from "#/features/auth/components/sign-in-form.tsx";

export const Route = createFileRoute("/sign-in")({
  beforeLoad: async () => {
    if (!(await hasOwnerFn())) throw redirect({ to: "/setup" });
    if (await getSessionUserFn()) throw redirect({ to: "/" });
  },
  component: () => (
    <main className="shell-focus">
      <div className="shell-focus__main stack">
        <h1>Sign in</h1>
        <SignInForm />
      </div>
    </main>
  ),
});
