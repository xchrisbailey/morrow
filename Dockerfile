# syntax=docker/dockerfile:1
FROM node:22-slim AS build
RUN npm install -g pnpm@12.15.0
WORKDIR /repo
COPY . .
RUN pnpm install --frozen-lockfile
# vp build (app into .output) then vp pack (cli bundle into .output/cli).
RUN pnpm build

# nitro bundles the server and traces better-sqlite3 into .output/server/node_modules.
FROM node:22-alpine
WORKDIR /app
ENV NODE_ENV=production \
    PORT=3000 \
    MORROW_DATA_DIR=/data
COPY --from=build --chown=node:node /repo/.output ./.output
COPY --from=build --chown=node:node /repo/drizzle ./drizzle
# The cli bundle (`node cli <cmd>`); only better-sqlite3 stays external, so let
# it resolve from the app's traced node_modules.
RUN mv .output/cli ./cli && ln -s /app/.output/server/node_modules /app/node_modules
# Pre-create the data dir owned by `node` so a fresh named volume is writable.
RUN mkdir /data && chown node:node /data
USER node
VOLUME /data
EXPOSE 3000
HEALTHCHECK --interval=30s --timeout=5s --start-period=15s --retries=3 \
  CMD wget -q -O /dev/null "http://127.0.0.1:${PORT}/api/health" || exit 1
CMD ["node", ".output/server/index.mjs"]
