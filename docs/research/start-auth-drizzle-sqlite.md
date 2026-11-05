# TanStack Start + better-auth + Drizzle v1 RC on SQLite

Ticket: xchrisbailey/morrow#14. Researched 2026-11-05. Claims marked **[verified]** were run in a scratch project (Node 26 locally, pnpm 10; nothing Node-26-specific was used) rather than read from docs.

## Recommendation

| Package | Version | Note |
| --- | --- | --- |
| `drizzle-orm` / `drizzle-kit` | `1.0.0-rc.5` (both) | npm `rc` tag, published 2026-10-21. `latest` is still 0.45.4, so always pin the exact RC. |
| `better-auth` | `1.7.17` | love-all pins 1.7.12; 1.7.17 is `latest`. |
| `@better-auth/drizzle-adapter` | `1.7.17` | Peer: `drizzle-orm ^0.45.2 \|\| >=1.0.0-rc.1 <2.0.0`. better-auth re-exports it as `better-auth/adapters/drizzle`, so a separate dependency is optional. |
| `@tanstack/react-start` | `^1.169.4` | `latest`; better-auth peers `^1.0.0`. |
| `better-sqlite3` | `^13.0.3` | Node >=22. |
| `nitro` | `3.0.261103-rc` | `latest` tag; love-all is on `3.0.260610-beta`. |
| `vite-plus` | `1.5.0` | love-all is on 1.4.0. |

Other versions are unchanged from love-all (`@tanstack/react-router` 1.170.46, `react-query` 5.106.1, `react-form` 1.33.5).

## SQLite driver: `better-sqlite3`

Drizzle's SQLite docs list three natively supported drivers: `libsql` (`drizzle-orm/libsql`), `node:sqlite` (`drizzle-orm/node-sqlite`) and `better-sqlite3` (`drizzle-orm/better-sqlite3`) ([get-started-sqlite](https://orm.drizzle.team/docs/get-started-sqlite)). All three have v1 RC pages. The recommendation is `better-sqlite3`.

- It is synchronous, which suits a single-process, single-file database, and it is the long-standing default for Drizzle plus better-auth. Drizzle's own SQLite getting-started page walks through libsql, but libsql's extras (remote Turso, encryption, extra ALTERs) are not needed for one container plus one volume.
- `node:sqlite` is Stability 1.1 "Active development" in Node 22 and needs no flag from v22.13 ([Node 22 docs](https://nodejs.org/docs/latest-v22.x/api/sqlite.html)). It has no native-build story at all, which is attractive, but its API can still change and Drizzle Kit has a separate `kit/node-sqlite` dist-tag, which suggests kit support is newer. Revisit once it reaches Stability 2.
- **Native builds in Docker [verified]:** `better-sqlite3@13.0.3` ships prebuilt binaries for linux x64/arm64 for both glibc and musl, darwin and win32 (`prebuilds/*.node`, including `linuxmusl-*`). No node-gyp, python or compiler is needed in the image, on `node:22-slim` or `node:22-alpine`. pnpm must be allowed to run its install script: `allowBuilds: { better-sqlite3: true }` in `pnpm-workspace.yaml` (pnpm 10 prints "Ignored build scripts: better-sqlite3" otherwise). Even if the script is skipped, the prebuild is what is loaded, but allow it so a fallback source build works.
- **Nitro bundling [verified]:** `nitro build` (3.0.261103-rc) traces `better-sqlite3` into `.output/server/node_modules/better-sqlite3` including all `prebuilds/*.node`. Everything else (drizzle-orm, better-auth) is bundled into `.output/server/_libs`. The existing love-all Dockerfile pattern (copy only `.output` into `node:22-alpine`) therefore works; the output is about 21 MB. The traced copy includes every platform's prebuild; this only costs size.
- Pragmas to set at connection time: `journal_mode = WAL`, `foreign_keys = ON` (better-auth's generated tables use `ON DELETE CASCADE`, which SQLite ignores unless foreign keys are on).

```ts
import Database from "better-sqlite3";
import { drizzle } from "drizzle-orm/better-sqlite3";
const sqlite = new Database(process.env.DATABASE_PATH ?? "./data/morrow.db");
sqlite.pragma("journal_mode = WAL");
sqlite.pragma("foreign_keys = ON");
export const db = drizzle({ client: sqlite, schema });
```

## better-auth with Drizzle v1 RC on SQLite

- **Compatible [verified].** The adapter's peer range explicitly includes `>=1.0.0-rc.1 <2.0.0`. With `drizzleAdapter(db, { provider: "sqlite", schema })` on `drizzle-orm@1.0.0-rc.5` + `better-sqlite3`, sign-up, migration and sessions worked end to end in a scratch project. Docs: [Drizzle adapter](https://www.better-auth.com/docs/adapters/drizzle).
- **Schema generation:** `npx auth@latest generate --adapter drizzle --dialect sqlite --output src/db/auth-schema.ts` (the CLI package is `auth`, not `@better-auth/cli`). It produces `user`, `session`, `account`, `verification` as `sqliteTable`s with `timestamp_ms` integer columns and cascade FKs. Plugins (for example `rateLimit` with database storage) add tables on regeneration. The schema file is committed and is part of the app's own Drizzle schema; the app's tables reference `user.id` (text). Then `drizzle-kit generate` produces the migration. The better-auth CLI `migrate` command only works with the built-in Kysely adapter, so it is not used here ([database docs](https://www.better-auth.com/docs/concepts/database)). Likewise `getMigrations` is Kysely-only.
- **Gotcha [verified]:** the default generated file imports `relations` from `drizzle-orm`, which does **not exist in drizzle-orm 1.0.0-rc.5** (module import fails, and `drizzle-kit generate` errors with `relations is not a function`). Two options:
  1. Delete the generated `relations(...)` blocks and keep tables only (verified working; better-auth does not need relations unless `advanced.database.joins` is on).
  2. Use the Relations v2 variant: import from `@better-auth/drizzle-adapter/relations-v2`, regenerate, and merge `authRelations` (a `defineRelationsPart` result) into `drizzle({ client, relations: { ...relations, ...authRelations } })` ([docs](https://www.better-auth.com/docs/adapters/drizzle)). Since the app will use Relational Queries v2 anyway under v1, prefer this once the app has its own `defineRelations`. I did not run option 2 end to end; I read the generator source and the docs.
- **Migrations layout (v1):** `drizzle-kit generate` writes one folder per migration (`drizzle/<timestamp>_<name>/migration.sql` + `snapshot.json`), with no `journal.json` ([upgrade-v1](https://orm.drizzle.team/docs/upgrade-v1)) [verified].
- Import path: docs use `@better-auth/drizzle-adapter`; `better-auth/adapters/drizzle` also exists in 1.7.17 and is what love-all uses. Pick one; depending on the standalone package is the documented path.

## Owner-only sign-up

Built-in options ([options reference](https://www.better-auth.com/docs/reference/options), [hooks](https://www.better-auth.com/docs/concepts/hooks), [database hooks](https://www.better-auth.com/docs/concepts/database)):

- `emailAndPassword.disableSignUp: true`: static, turns sign-up off entirely (also `disabledPaths: ["/sign-up/email"]`, and per-provider `disableSignUp`). It cannot be "open until the first user exists" on its own.
- `hooks.before` with `createAuthMiddleware` throwing `APIError` on `ctx.path === "/sign-up/email"`: endpoint level, email only.
- `databaseHooks.user.create.before`: runs on any user creation (email or OAuth); returning `false` or throwing aborts it.

**Recommended: `databaseHooks.user.create.before`** counting rows, so the first sign-up wins and every later one is rejected, whichever provider is used. Verified: first sign-up succeeds, second throws `FORBIDDEN "Sign-up closed"`.

```ts
databaseHooks: { user: { create: { before: async () => {
  const [{ n }] = await db.select({ n: count() }).from(schema.user);
  if (n > 0) throw new APIError("FORBIDDEN", { message: "Sign-up closed" });
} } } },
```

Caveats: (a) two truly simultaneous first requests could both pass the count; acceptable for a self-hosted single owner, or wrap the insert in a Drizzle transaction / make the first-run flow a one-time setup route. (b) Anyone who reaches a fresh instance first becomes Owner. Mitigation: require an optional `OWNER_SETUP_TOKEN` env var checked in the same hook, or have a seed script create the Owner via `auth.api.signUpEmail` and set `disableSignUp: true` permanently. The UI should hide the sign-up form once a user exists (a server function returning `hasOwner`).

## Mounting in TanStack Start

From [better-auth TanStack Start integration](https://www.better-auth.com/docs/integrations/tanstack):

- Route handler `src/routes/api/auth/$.ts`: `createFileRoute('/api/auth/$')({ server: { handlers: { GET, POST } } })`, each calling `auth.handler(request)`.
- Add `tanstackStartCookies()` from `better-auth/tanstack-start` as the **last** plugin so `Set-Cookie` works from server functions.
- Session in server functions: `auth.api.getSession({ headers: getRequestHeaders() })` (`getRequestHeaders` from `@tanstack/react-start/server`). Wrap in a `getSession` server function.
- `beforeLoad`: call the `getSession` server function, `throw redirect({ to: "/login" })` if absent, return `{ user }` into route context.
- `beforeLoad` is route UX, not the data boundary ([Start server functions guide](https://tanstack.com/start/latest/docs/framework/react/guide/server-functions)): every data-touching server function must itself check the session, ideally via a shared `createMiddleware().server(...)` that calls `auth.api.getSession` and passes `user` into context.
- Set `baseURL` / `BETTER_AUTH_URL` and `secret` / `BETTER_AUTH_SECRET`; better-auth warns when the base URL is unset.
- Note: love-all runs better-auth in a separate API; morrow is a single app, so one `auth` instance and one shared `db` object (better-auth's adapter and the app's queries can share the same better-sqlite3 handle, so no second pool).

## Migrations at container start (nitro node build)

Nitro docs: plugins run once at server startup, registered via the `plugins` option or `plugins/` dir; async plugins are the documented way to do startup work, not top-level await ([nitro plugins](https://nitro.build/docs/plugins), [node preset](https://nitro.build/deploy/node)). **[verified]** with a scratch build: a `definePlugin` that calls the sync `migrate(db, { migrationsFolder })` from `drizzle-orm/better-sqlite3/migrator`, registered with `nitro({ plugins: ["./plugins/migrate.ts"] })` in `vite.config.ts`, ran before "Listening on" and created the tables and `__drizzle_migrations`.

- The `drizzle/` folder is **not** bundled into `.output`; copy it into the image and resolve it from a `MIGRATIONS_DIR` env var (default `./drizzle` relative to cwd, since a relative path failed with ENOENT when it was missing). Dockerfile: `COPY --from=build /repo/drizzle ./drizzle` next to `.output`.
- Database file lives on the volume (`DATABASE_PATH=/data/morrow.db`); the container user needs write access to `/data` (WAL writes `-wal` and `-shm` files next to it).
- Alternative: a separate `migrate.ts` run via the entrypoint (`node migrate.mjs && node .output/server/index.mjs`) as love-all does. Startup plugin is simpler for a single instance; with one container and one SQLite file there is no concurrent-migrator problem.
- Dev: `drizzle-kit generate` after schema changes; `drizzle-kit migrate` / the same startup plugin applies them locally. Existing 0.x migration folders would need `drizzle-kit up`; a new project does not.

## Risks and blockers

- Drizzle v1 is still RC (`rc.5`; npm `latest` is 0.45.4). Pin exact versions; expect further RC churn. `drizzle-kit` and `drizzle-orm` must be bumped together. The `drizzle-orm` override in love-all's workspace (one Drizzle everywhere) is worth copying since better-auth and nitro list it as an optional peer.
- better-auth's CLI emits v0-style `relations()` that breaks on drizzle-orm v1; handle per the gotcha above. Re-check this on each better-auth bump.
- Nitro is on an RC (`3.0.261103-rc`) and vite-plus peer rules in love-all (`peerDependencyRules.allowAny: vite`) must be copied.
- Not verified: a full TanStack Start build (only a nitro-only scratch build was run), `drizzle-kit migrate`/`studio` CLI against `better-sqlite3` in rc.5 (only `generate` and the runtime migrator were run), and `node:sqlite` with Drizzle Kit. No blockers found.
