import { createFileRoute, redirect } from "@tanstack/react-router";
import { hasOwnerFn } from "#/features/auth/auth.functions.ts";
import { SetupForm } from "#/features/auth/components/setup-form.tsx";

export const Route = createFileRoute("/setup")({
  beforeLoad: async () => {
    if (await hasOwnerFn()) throw redirect({ to: "/sign-in" });
  },
  component: () => (
    <main className="shell-focus">
      <div className="shell-focus__main stack">
        <h1>Set up Morrow</h1>
        <p className="text-muted-foreground">
          Create the Owner account for this Instance. The setup token is in the server logs.
        </p>
        <SetupForm />
      </div>
    </main>
  ),
});
