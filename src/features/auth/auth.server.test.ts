import { describe, expect, it } from "vite-plus/test";
import { createAuth } from "#/server/auth.ts";
import { toAppError } from "#/server/errors.ts";
import { createTestDb, insertUser } from "#/server/test-db.ts";
import { assertCanCreateOwner, hasOwner } from "./auth.server.ts";

describe("hasOwner", () => {
  it("is false on a fresh Instance and true after the Owner exists", () => {
    const { db } = createTestDb();
    expect(hasOwner(db)).toBe(false);
    insertUser(db);
    expect(hasOwner(db)).toBe(true);
  });
});

describe("assertCanCreateOwner", () => {
  it("allows the first user with the right token", () => {
    const { db } = createTestDb();
    expect(() => assertCanCreateOwner(db, "tok", "tok")).not.toThrow();
  });

  it("rejects a wrong or missing token, naming the token field", () => {
    const { db } = createTestDb();
    for (const provided of ["nope", "", null, undefined]) {
      try {
        assertCanCreateOwner(db, "tok", provided);
        expect.unreachable();
      } catch (error) {
        expect(toAppError(error)).toMatchObject({ code: "FORBIDDEN", field: "token" });
      }
    }
    expect(() => assertCanCreateOwner(db, null, "tok")).toThrow();
  });

  it("rejects everything once an Owner exists, even with the token", () => {
    const { db } = createTestDb();
    insertUser(db);
    expect(() => assertCanCreateOwner(db, "tok", "tok")).toThrow(/already has an Owner/);
  });
});

describe("better-auth user.create guard", () => {
  const make = () => {
    const { db } = createTestDb();
    const auth = createAuth({
      db,
      baseURL: "http://localhost:3000",
      secret: "x".repeat(32),
      setupToken: () => "tok",
    });
    const signUp = (email: string, token?: string) =>
      auth.api.signUpEmail({
        body: { name: "Owner", email, password: "correct horse" },
        headers: new Headers(token ? { "x-setup-token": token } : {}),
      });
    return { db, signUp };
  };

  it("creates the Owner once, then rejects any later sign-up", async () => {
    const { db, signUp } = make();
    await expect(signUp("a@example.com", "bad")).rejects.toThrow();
    expect(hasOwner(db)).toBe(false);
    await signUp("a@example.com", "tok");
    expect(hasOwner(db)).toBe(true);
    await expect(signUp("b@example.com", "tok")).rejects.toThrow();
  });
});
