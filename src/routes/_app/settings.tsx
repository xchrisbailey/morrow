import { createFileRoute } from "@tanstack/react-router";
import { DisplayNameForm } from "#/features/profile/components/display-name-form.tsx";
import { viewerQueryOptions } from "#/features/profile/profile.queries.ts";

export const Route = createFileRoute("/_app/settings")({
  loader: ({ context }) => context.queryClient.ensureQueryData(viewerQueryOptions()),
  component: Settings,
});

function Settings() {
  return (
    <div className="container container--sm stack">
      <h1>Settings</h1>
      <section className="stack">
        <h2>Profile</h2>
        <DisplayNameForm />
      </section>
    </div>
  );
}
