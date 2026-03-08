import { expect, test } from "@playwright/test";

test.describe("mobile journeys", () => {
  test("covers the main v1 flows on a phone viewport", async ({ page }) => {
    await page.goto("/");
    await page.evaluate(() => window.localStorage.clear());
    await page.reload();

    await expect(page.getByRole("heading", { name: "Onboarding" })).toBeVisible();
    await page.locator('input[placeholder="Optional"]').fill("Nora");
    await page.locator('input[type="email"]').fill("nora@example.com");
    await page.locator('input[type="date"]').fill("2026-02-10");
    await page.locator('input[type="number"]').fill("28");
    await page.getByRole("button", { name: "Continue" }).click();

    await expect(page).toHaveURL("/");
    await expect(page.getByRole("heading", { name: "Home" })).toBeVisible();
    await expect(page.getByText("Cycle day", { exact: true })).toBeVisible();

    await page.getByRole("button", { name: "Cramps" }).click();
    await expect(page.getByText("Cramps logged")).toBeVisible();

    await page.getByPlaceholder("Log anything... cramps, low energy, took ibuprofen, medium flow").fill(
      "bad cramps, low energy, took ibuprofen, medium flow, period started",
    );
    await page.getByRole("button", { name: "Review parsed log" }).click();
    await expect(page.getByRole("heading", { name: "Structured interpretation" })).toBeVisible();
    await expect(page.getByText("Flow: medium")).toBeVisible();
    await expect(page.getByText("Energy: low")).toBeVisible();
    await expect(page.getByText("Pain: 3/4")).toBeVisible();
    await page.getByRole("button", { name: "Save log" }).click();
    await expect(page.getByText(/Saved today/i)).toBeVisible();
    await expect(page.getByText("bad cramps, low energy, took ibuprofen, medium flow, period started")).toBeVisible();

    await page.getByRole("link", { name: "Ask" }).click();
    await expect(page.getByRole("heading", { name: "Ask" })).toBeVisible();
    await page.getByRole("button", { name: "When do I usually start my period?" }).click();
    await expect(page.getByText(/You usually start around every/i)).toBeVisible();
    await expect(page.getByText(/Your next likely window is/i)).toBeVisible();

    await page.getByRole("link", { name: "Import" }).click();
    await expect(page.getByRole("heading", { name: "Import" })).toBeVisible();
    await page.getByPlaceholder(/02\/14\/2026/).fill(
      [
        "2026-01-01 - got my period",
        "2026-01-05 - period ended",
        "2026-01-29 - started my period today",
        "2026-02-02 - period is over",
        "2026-02-25 - spotting and cramps",
      ].join("\n"),
    );
    await page.getByRole("button", { name: "Parse candidates" }).click();

    await expect(page.getByRole("heading", { name: "Review import" })).toBeVisible();
    await expect(page.getByText("5 detected")).toBeVisible();
    await page.getByRole("button", { name: "Reject" }).last().click();
    await page.getByRole("button", { name: "Save accepted events" }).click();

    await expect(page).toHaveURL("/history");
    await expect(page.getByRole("heading", { name: "History" })).toBeVisible();
    await expect(page.getByText("Recent cycles")).toBeVisible();
    await expect(page.getByText("28 day cycle")).toBeVisible();
    await expect(page.getByText("5 day period")).toBeVisible();

    await page.reload();
    await expect(page.getByText("28 day cycle")).toBeVisible();

    await page.getByRole("link", { name: "Settings" }).click();
    await expect(page.getByRole("heading", { name: "Settings" })).toBeVisible();
    const remindersToggle = page.locator(".toggle").first();
    await remindersToggle.click();
    await expect(remindersToggle).toHaveAttribute("aria-pressed", "true");

    page.once("dialog", (dialog) => dialog.accept());
    await page.getByRole("button", { name: "Delete all data" }).click();
    await expect(page).toHaveURL("/onboarding");
    await expect(page.getByRole("heading", { name: "Onboarding" })).toBeVisible();
  });
});
