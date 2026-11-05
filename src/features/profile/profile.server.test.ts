import { describe, expect, it } from "vite-plus/test";
import { toAppError } from "#/server/errors.ts";
import { createTestDb, insertUser } from "#/server/test-db.ts";
import { getViewer, updateDisplayName } from "./profile.server.ts";

describe("display name", () => {
  it("updates user.name", () => {
    const { db } = createTestDb();
    const id = insertUser(db);
    expect(updateDisplayName(db, id, { name: "  Grace  " }).name).toBe("Grace");
    expect(getViewer(db, id).name).toBe("Grace");
  });

  it("rejects an empty name with a field error", () => {
    const { db } = createTestDb();
    const id = insertUser(db);
    try {
      updateDisplayName(db, id, { name: "   " });
      expect.unreachable();
    } catch (error) {
      expect(toAppError(error)).toMatchObject({ code: "VALIDATION", field: "name" });
    }
    expect(getViewer(db, id).name).toBe("Ada");
  });

  it("is not found for an unknown user", () => {
    const { db } = createTestDb();
    expect(() => updateDisplayName(db, "nope", { name: "x" })).toThrow();
  });
});
