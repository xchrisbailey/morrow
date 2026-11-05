import tailwindcss from "@tailwindcss/vite";
import { tanstackStart } from "@tanstack/react-start/plugin/vite";
import viteReact from "@vitejs/plugin-react";
import { nitro } from "nitro/vite";
import { defineConfig } from "vite-plus";

// Unit tests only need module resolution, not the app's build plugins.
const testing = Boolean(process.env.VITEST);

export default defineConfig({
  resolve: { tsconfigPaths: true },
  server: { port: 3000 },
  fmt: {
    ignorePatterns: [
      "AGENTS.md",
      "docs/agents/**",
      "docs/adr/**",
      "**/routeTree.gen.ts",
      "drizzle/**",
      "src/server/auth-schema.ts",
      "design/preview/index.html",
    ],
  },
  lint: {
    ignorePatterns: ["**/routeTree.gen.ts", "drizzle/**"],
    plugins: ["typescript", "react", "oxc"],
    rules: {
      "react/rules-of-hooks": "error",
      "react/exhaustive-deps": "warn",
      "vite-plus/prefer-vite-plus-imports": "error",
    },
    jsPlugins: [{ name: "vite-plus", specifier: "vite-plus/oxlint-plugin" }],
    options: { typeAware: true, typeCheck: true },
  },
  // `pnpm build` bundles cli/index.ts (with morrow's server code) into one file
  // for `node cli <cmd>`; only the native better-sqlite3 stays external.
  pack: {
    entry: { index: "cli/index.ts" },
    outDir: ".output/cli",
    format: "esm",
    platform: "node",
    clean: true,
    // Makes `node cli` resolve to index.mjs once the folder is copied next to .output.
    copy: ["cli/package.json"],
    dts: false,
    deps: { alwaysBundle: [/.*/], neverBundle: ["better-sqlite3"] },
  },
  // e2e/ belongs to Playwright.
  test: { include: ["src/**/*.test.ts"] },
  run: {
    // package.json scripts are not cached: some (db migrate, dev) have side
    // effects the cache can't see. Cache specific tasks via `run.tasks` instead.
    cache: { scripts: false },
  },
  // nitro builds a standalone Node server in .output/ for the Docker image.
  plugins: testing
    ? []
    : [
        tailwindcss(),
        tanstackStart(),
        nitro({
          preset: "node-server",
          // Runs migrations (with a pre-migrate backup) and logs the setup token before listening.
          plugins: ["./src/server/migrate-plugin.ts"],
          rollupConfig: {
            // React libraries mark files "use client"; that only matters for React
            // Server Components, which we don't use.
            onwarn(warning: { code?: string }, warn: (warning: { code?: string }) => void) {
              if (warning.code !== "MODULE_LEVEL_DIRECTIVE") warn(warning);
            },
          },
        }),
        viteReact(),
      ],
});
