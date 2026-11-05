import { createFileRoute } from "@tanstack/react-router";
import { Scratchpad } from "#/features/scratchpad/components/scratchpad.tsx";
import { scratchpadQueryOptions } from "#/features/scratchpad/scratchpad.queries.ts";

export const Route = createFileRoute("/_app/")({
  // The Scratchpad is the page's main data: it arrives with the page.
  loader: ({ context }) => context.queryClient.ensureQueryData(scratchpadQueryOptions()),
  component: Scratchpad,
});
