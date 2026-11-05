import { describe, expect, it } from "vite-plus/test";
import { createTestDb, insertUser } from "#/server/test-db.ts";
import { getScratchpad, saveScratchpad } from "./scratchpad.server.ts";

const blocks = (text: string) => [{ id: "b1", type: "paragraph", content: text }];

describe("scratchpad", () => {
  it("is empty until saved", () => {
    const { db } = createTestDb();
    const id = insertUser(db);
    expect(getScratchpad(db, id)).toEqual({ content: [], updatedAt: null });
  });

  it("saves and reads back the block array", () => {
    const { db } = createTestDb();
    const id = insertUser(db);
    saveScratchpad(db, id, { content: blocks("hello") });
    expect(getScratchpad(db, id).content).toEqual(blocks("hello"));
  });

  it("keeps one row per user and replaces content", () => {
    const { db, sqlite } = createTestDb();
    const id = insertUser(db);
    saveScratchpad(db, id, { content: blocks("one") });
    saveScratchpad(db, id, { content: blocks("two") });
    expect(getScratchpad(db, id).content).toEqual(blocks("two"));
    expect(sqlite.prepare("SELECT count(*) AS n FROM scratchpad").get()).toEqual({ n: 1 });
  });

  it("is deleted with its user", () => {
    const { db, sqlite } = createTestDb();
    const id = insertUser(db);
    saveScratchpad(db, id, { content: blocks("x") });
    sqlite.prepare("DELETE FROM user WHERE id = ?").run(id);
    expect(sqlite.prepare("SELECT count(*) AS n FROM scratchpad").get()).toEqual({ n: 0 });
  });
});
