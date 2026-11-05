import { expect, test } from "@playwright/test";

const email = "owner@example.com";
const password = "correct horse battery";
const note = "Hello from the smoke test";

test("fresh Instance: set up, sign out, sign in, Scratchpad persists", async ({ page }) => {
  const token = process.env.MORROW_E2E_TOKEN;
  if (!token) throw new Error("MORROW_E2E_TOKEN is not set (see e2e/global-setup.ts)");

  // A fresh Instance sends everything to /setup.
  await page.goto("/sign-in");
  await expect(page).toHaveURL(/\/setup$/);

  await page.getByLabel("Setup token").fill(token);
  await page.getByLabel("Display name").fill("Owner");
  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Create Owner" }).click();

  // Setup signs the Owner in and lands on the Scratchpad.
  await expect(page.getByRole("heading", { name: "Scratchpad" })).toBeVisible();

  await page.getByRole("button", { name: "Account" }).click();
  await page.getByRole("menuitem", { name: "Sign out" }).click();
  await expect(page).toHaveURL(/\/sign-in$/);

  await page.getByLabel("Email").fill(email);
  await page.getByLabel("Password").fill(password);
  await page.getByRole("button", { name: "Sign in" }).click();
  await expect(page.getByRole("heading", { name: "Scratchpad" })).toBeVisible();

  const editor = page.getByRole("textbox").first();
  await editor.click();
  await page.keyboard.type(note);
  await expect(page.getByText(note)).toBeVisible();

  // Autosave is debounced (~800ms); wait for the save request before reloading.
  await page.waitForResponse(
    (r) => r.url().includes("/_serverFn") && r.request().method() === "POST",
  );
  await page.reload();
  await expect(page.getByText(note)).toBeVisible();
});
