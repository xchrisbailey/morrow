import { describe, expect, it } from "vite-plus/test";
import { z } from "zod";
import { AppError, toAppError, zodValidator } from "./errors.ts";

describe("AppError", () => {
  it("survives being rebuilt from just its message (as after serialisation)", () => {
    const sent = new AppError("VALIDATION", "Too long", "name");
    const received = new Error(sent.message);
    expect(toAppError(received)).toEqual({
      code: "VALIDATION",
      message: "Too long",
      field: "name",
    });
  });

  it("maps unknown errors to a generic one", () => {
    expect(toAppError(new Error("boom")).code).toBe("INTERNAL");
  });

  it("zodValidator names the failing field", () => {
    const validate = zodValidator(z.object({ name: z.string().min(1, "Enter a name") }));
    try {
      validate({ name: "" });
      expect.unreachable();
    } catch (error) {
      expect(toAppError(error)).toEqual({
        code: "VALIDATION",
        message: "Enter a name",
        field: "name",
      });
    }
  });
});
