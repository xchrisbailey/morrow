# Morrow

A self-hosted personal hub for solo developers: notes, boards and todos. One container, one SQLite file, one Owner.

## Install

With Docker:

```sh
docker run -d --name morrow \
  -p 3000:3000 \
  -e MORROW_URL=http://localhost:3000 \
  -v morrow-data:/data \
  ghcr.io/xchrisbailey/morrow:latest
```

Or copy [`compose.yaml`](compose.yaml), set `MORROW_URL`, and run `docker compose up -d`.

On first start Morrow migrates its database and, because there is no Owner yet, prints a setup token. Read it from the logs:

```sh
docker logs morrow
#   No Owner yet. Create one at:
#     http://localhost:3000/setup
#   Setup token: <token>
```

Open `/setup`, enter the token, your name, email and a password. That creates the Owner; setup then closes for good and Morrow has no sign-up. To choose the token yourself, set `MORROW_SETUP_TOKEN`.

## Environment

| Variable             | Default   | Description                                                                                                                                                                |
| -------------------- | --------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| `MORROW_URL`         | required  | Public URL of the Instance, e.g. `https://morrow.example.com`. Morrow refuses to start in production without it. Cookies are `Secure` only when it starts with `https://`. |
| `MORROW_DATA_DIR`    | `/data`   | Where the database, backups and secret live. The image sets `/data`.                                                                                                       |
| `MORROW_SECRET`      | generated | Signing secret for sessions. If unset it is generated once and kept in `$MORROW_DATA_DIR/secret`.                                                                          |
| `MORROW_SETUP_TOKEN` | generated | Token needed to create the Owner. Only used while no Owner exists.                                                                                                         |
| `PORT`               | `3000`    | Port the server listens on.                                                                                                                                                |

## Data and bind mounts

Everything is under `/data` (`morrow.db`, `backups/`, `secret`). The container runs as the `node` user (uid 1000). A named volume works as is. For a bind mount, make the directory writable by that user:

```sh
mkdir -p ./morrow-data && sudo chown 1000:1000 ./morrow-data
```

## Reverse proxy

Morrow speaks plain HTTP on `PORT`. Put TLS in front and set `MORROW_URL` to the public `https://` URL, which must match what browsers use.

Caddy:

```
morrow.example.com {
  reverse_proxy morrow:3000
}
```

Traefik (compose labels):

```yaml
labels:
  - traefik.enable=true
  - traefik.http.routers.morrow.rule=Host(`morrow.example.com`)
  - traefik.http.routers.morrow.tls.certresolver=letsencrypt
  - traefik.http.services.morrow.loadbalancer.server.port=3000
```

`/api/health` returns 200 once migrations have run and the database answers (503 otherwise). The image's `HEALTHCHECK` uses it.

## Backup

```sh
docker exec morrow node cli backup
```

This writes a consistent snapshot (`VACUUM INTO`, safe while Morrow runs) to `/data/backups/<timestamp>.db` and prints the path. Copy `/data/backups` off the host, or back up the whole volume. To restore, stop the container, replace `/data/morrow.db` with a snapshot (delete any `morrow.db-wal` and `morrow.db-shm` next to it), and start again.

## Reset the Owner password

```sh
docker exec -it morrow node cli reset-password
```

It prompts for the new password, sets it and signs out every session. For scripts, use `--password-stdin` (preferred) or `--password <value>`:

```sh
printf '%s' "$NEW_PASSWORD" | docker exec -i morrow node cli reset-password --password-stdin
```

## Upgrades

Pull the new image and recreate the container:

```sh
docker compose pull && docker compose up -d
```

Pending migrations run on start. If any are pending, Morrow first copies the database to `/data/backups/pre-migrate-<timestamp>.db`. Migrations only go forward and there is no downgrade: to go back to an older version, stop the container, restore the `pre-migrate-*.db` snapshot as `/data/morrow.db`, and run the older image tag.

## Development

```sh
pnpm install
pnpm dev          # http://localhost:3000, data in ./data
pnpm ready        # vp check, vp test, build (app and cli)
pnpm test:e2e     # Playwright smoke against the production build (run pnpm build first)
```

Install the browser once with `pnpm exec playwright install chromium`. Releases are built by pushing a `v*` tag; the workflow publishes `ghcr.io/xchrisbailey/morrow` for linux/amd64 and linux/arm64.
