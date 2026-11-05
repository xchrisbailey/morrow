import { describe, expect, it } from "vite-plus/test";
import { baseUrl } from "./env.ts";

describe("baseUrl", () => {
  it("defaults to the dev server outside production", () => {
    expect(baseUrl({})).toBe("http://localhost:3000");
  });

  it("requires MORROW_URL in production", () => {
    expect(() => baseUrl({ NODE_ENV: "production" })).toThrow(/MORROW_URL is required/);
  });

  it("trims trailing slashes", () => {
    expect(baseUrl({ NODE_ENV: "production", MORROW_URL: "https://m.example.com//" })).toBe(
      "https://m.example.com",
    );
  });
});
