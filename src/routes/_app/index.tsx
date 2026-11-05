import { useQuery } from "@tanstack/react-query";
import { createFileRoute } from "@tanstack/react-router";
import { PlusIcon } from "lucide-react";
import { viewerQueryOptions } from "#/features/profile/profile.queries.ts";
import { Scratchpad } from "#/features/scratchpad/components/scratchpad.tsx";
import { scratchpadQueryOptions } from "#/features/scratchpad/scratchpad.queries.ts";
import { spaceOf, spaces } from "#/features/spaces/spaces.ts";
import { TodayHero } from "#/features/today/components/today-hero.tsx";

export const Route = createFileRoute("/_app/")({
  // The Scratchpad is the page's main data: it arrives with the page.
  loader: ({ context }) => context.queryClient.ensureQueryData(scratchpadQueryOptions()),
  component: Home,
});

/** A space's home: the Today row (hero + Scratchpad), then the space's board. */
function Home() {
  const { data: viewer } = useQuery(viewerQueryOptions());
  const space = spaceOf(Route.useSearch());
  const spaceLabel = spaces.find((s) => s.id === space)?.label ?? "Personal";

  return (
    <>
      <section className="today" aria-label="Today">
        <TodayHero name={viewer?.name} />
        <section className="today__panel" aria-labelledby="scratchpad-title">
          <h2 id="scratchpad-title">Scratchpad</h2>
          <div className="today__panel-body">
            <Scratchpad />
          </div>
        </section>
      </section>

      <section className="page-block" aria-labelledby="board-title">
        <div className="page-block__header">
          <h2 id="board-title" className="page-block__title">
            {spaceLabel} board
          </h2>
        </div>
        {/* Columns and cards arrive with Sections; until then the board shows its empty slot. */}
        <div className="board">
          <div className="board__new-column flex items-center justify-center gap-2 text-muted-foreground">
            <PlusIcon className="size-4" aria-hidden="true" />
            No columns yet
          </div>
        </div>
      </section>
    </>
  );
}
