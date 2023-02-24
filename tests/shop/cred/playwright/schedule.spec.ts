import { test, expect } from "@playwright/test";

test.beforeEach(async ({ page, context }) => {
  await context.addCookies([
    {
      name: "_cookies_accepted",
      value: "all",
      url: "https://login.ubuntu.com",
    },
    {
      name: "_cookies_accepted",
      value: "all",
      url: "http://localhost:8001",
    },
  ]);
  await page.goto("https://login.ubuntu.com");
  await page
    .getByLabel("Please type your email:")
    .fill("abhigyan.ghosh+testkeys9@canonical.com");
  await page.getByPlaceholder("Password", { exact: true }).fill("testkeys9");
  await page.getByPlaceholder("Password", { exact: true }).press("Enter");
});

test("Schedule an exam", async ({ page }) => {
  await page.goto("/credentials/your-exams");
  await page.getByRole("button", { name: "yes" }).click();
  // Click the get started link.
  await page.getByRole("link", { name: "Schedule" }).click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/schedule/);

  page.getByRole("button", { name: "submit" }).click();
  await expect(
    page.getByRole("heading", { name: "Everything is ready" })
  ).toBeVisible();
});

test("Reschedule an exam", async ({ page }) => {
  await page.goto("/credentials/your-exams");
  await page.getByRole("button", { name: "yes" }).click();
  // Click the get started link.
  await page.getByRole("link", { name: "Reschedule" }).click();

  // Expects the URL to contain intro.
  await expect(page).toHaveURL(/schedule/);

  page.getByRole("button", { name: "submit" }).click();
  await expect(
    page.getByRole("heading", { name: "Everything is ready" })
  ).toBeVisible();
});

test("cancel and exam", async ({ page }) => {
  await page.goto("/credentials/your-exams");
  await page.getByRole("button", { name: "yes" }).click();
  await page.getByRole("link", { name: "Cancel" }).click();

  await expect(page).toHaveURL(/your-exams/);

  await page.getByRole("button", { name: "Schedule", exact: true }).isVisible();
});
