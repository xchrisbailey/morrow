import { createServerFn } from "@tanstack/react-start";
import { getDatabase } from "#/server/db.ts";
import { zodValidator } from "#/server/errors.ts";
import { authed } from "#/server/middleware.ts";
import { saveScratchpadSchema } from "./scratchpad.schema.ts";
import { getScratchpad, saveScratchpad } from "./scratchpad.server.ts";

export const getScratchpadFn = createServerFn({ method: "GET" })
  .middleware([authed])
  .handler(({ context }) => getScratchpad(getDatabase().db, context.user.id));

export const saveScratchpadFn = createServerFn({ method: "POST" })
  .middleware([authed])
  .validator(zodValidator(saveScratchpadSchema))
  .handler(({ context, data }) => saveScratchpad(getDatabase().db, context.user.id, data));
