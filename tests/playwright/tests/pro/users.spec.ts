import { test, expect } from "@playwright/test";
import { acceptCookiePolicy, login } from "../../helpers/commands";
import { getRandomEmail } from "../../helpers/utils";

test.describe("/pro/users", () => {
  const email = getRandomEmail();

  test("It should add and delete a user correctly", async ({ page }) => {
    await page.goto("/pro/users");
    await login(page);
    await acceptCookiePolicy(page);

    await page.getByRole("button", { name: /Add new user/ }).click();
    await page.getByLabel("Name").fill("Angela");
    await page.getByLabel("email address").fill(email);
    await page
      .getByLabel("Role", { exact: true })
      .selectOption({ label: "Technical" });

    await page.route("/pro/accounts/*", async (route) => {
      const request = route.request();
      const postData = await request.postDataJSON();

      if (request.method() === "POST") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ email: postData.email, role: postData.role }),
        });
      } else if (request.method() === "DELETE") {
        await route.fulfill({
          status: 200,
          contentType: "application/json",
          body: JSON.stringify({ email: postData.email }),
        });
      }
    });

    await page
      .getByRole("button", { name: "Add new user", exact: true })
      .click();

    await page.waitForTimeout(3000);

    await expect(page.getByText(/User added successfully/)).toBeVisible();

    await page.getByPlaceholder("Search for users").fill(email);

    await expect(page.getByText(email)).toBeVisible();

    await page.getByLabel(`Edit user ${email}`).click();

    await page.locator("button[aria-label='delete']").click();

    await page.getByRole("button", { name: "Yes, remove user" }).click();

    await page.waitForTimeout(3000);

    await expect(page.getByText(/User deleted/)).toBeVisible();

    await page.getByPlaceholder("Search for users").fill(email);

    await expect(page.getByText(email)).not.toBeVisible();
  });
});
