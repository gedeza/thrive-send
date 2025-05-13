import { test, expect } from "@playwright/test";

test.describe("Content Calendar - E2E", () => {
  test("Editor can create content", async ({ page }) => {
    // login as editor (stub or UI action)
    await page.goto("/dashboard/content-calendar");
    await page.click("text=Add Content");
    await page.fill("input[placeholder=Title]", "Automated Post 1");
    await page.click("text=Create Content");
    await expect(page).toHaveText("Automated Post 1");
  });

  test("Viewer cannot see create button", async ({ page }) => {
    // login as viewer (stub)
    await page.goto("/dashboard/content-calendar");
    await expect(page.locator("text=Add Content")).not.toBeVisible();
  });
});