import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "#/server/db.ts";
import { zodValidator } from "#/server/errors.ts";
import { authed } from "#/server/middleware.ts";
import { displayNameSchema } from "./profile.schema.ts";
import { getViewer, updateDisplayName } from "./profile.server.ts";

export const getViewerFn = createServerFn({ method: "GET" })
  .middleware([authed])
  .handler(({ context }) => getViewer(getDatabase().db, context.user.id));

export const updateDisplayNameFn = createServerFn({ method: "POST" })
  .middleware([authed])
  .validator(zodValidator(displayNameSchema))
  .handler(({ context, data }) => updateDisplayName(getDatabase().db, context.user.id, data));
