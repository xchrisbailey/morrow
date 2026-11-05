import { definePlugin } from "nitro";
import { getDatabase } from "./db.ts";
import { backupsDirFor, runMigrations } from "./migrate.ts";
import { dataDir, migrationsDir } from "./env.ts";
import { authSecret } from "./env.ts";
import { initSetupToken } from "./setup-token.ts";

/**
 * Nitro startup plugin: runs before the server listens. Migrates (with a
 * pre-migrate backup), makes sure the auth secret exists, then logs the setup
 * token when there is no Owner yet.
 */
export default definePlugin(() => {
  const { sqlite, db } = getDatabase();
  runMigrations(sqlite, db, {
    migrationsFolder: migrationsDir(),
    backupsDir: backupsDirFor(dataDir()),
    log: (msg) => console.log(`[morrow] ${msg}`),
  });
  authSecret(dataDir());
  initSetupToken(db);
});
