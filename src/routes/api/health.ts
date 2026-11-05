import { createFileRoute } from "@tanstack/react-router";
import { getDatabase } from "#/server/db.ts";
import { migrationsDir } from "#/server/env.ts";
import { pendingMigrations } from "#/server/migrate.ts";

/** Healthy once every migration has been applied and the database answers. */
function check(): boolean {
  try {
    const { sqlite } = getDatabase();
    sqlite.prepare("SELECT 1").get();
    return pendingMigrations(sqlite, migrationsDir()).length === 0;
  } catch {
    return false;
  }
}

// Public on purpose: used by the Docker HEALTHCHECK, no data is returned.
export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: () => {
        const ok = check();
        return Response.json({ status: ok ? "ok" : "unavailable" }, { status: ok ? 200 : 503 });
      },
    },
  },
});
