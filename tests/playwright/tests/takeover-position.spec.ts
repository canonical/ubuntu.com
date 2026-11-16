import { test, expect, Page } from "@playwright/test";

// The test ships switched off, so turn it on in the served HTML
async function openHomepage(page: Page, cookies: Record<string, string>) {
  await page.context().addCookies(
    Object.entries(cookies).map(([name, value]) => ({
      name,
      value,
      url: test.info().project.use.baseURL,
    })),
  );
  await page.route("**/takeovers.json", (route) => route.fulfill({ json: [] }));
  await page.route(/\/$/, async (route) => {
    const response = await route.fetch();
    const body = (await response.text()).replace(
      "const takeoverSwitch = false;",
      "const takeoverSwitch = true;",
    );
    await route.fulfill({ response, body });
  });
  await page.goto("/");
}

const takeoverIsFirst = (page: Page) =>
  page.evaluate(
    () => document.querySelector(".js-hero, #takeover")?.id === "takeover",
  );

const testEvents = (page: Page) =>
  page.evaluate(() =>
    (window.dataLayer ?? []).filter((entry) => entry.event === "test"),
  );

test("the variant group sees the takeover above the hero", async ({ page }) => {
  await openHomepage(page, {
    _cookies_accepted: "all",
    control_or_variant: "variant",
  });

  expect(await takeoverIsFirst(page)).toBe(true);
  await expect(page.locator("#test-takeover-primary-url")).toBeVisible();
  expect(await testEvents(page)).toMatchObject([
    { test_type: "takeover position", control_or_variant: "variant" },
  ]);
});

test("the control group keeps the hero first", async ({ page }) => {
  await openHomepage(page, {
    _cookies_accepted: "all",
    control_or_variant: "control",
  });

  expect(await takeoverIsFirst(page)).toBe(false);
  await expect(page.locator("#takeover-primary-url")).toBeVisible();
});

test("no group is assigned without analytics consent", async ({ page }) => {
  await openHomepage(page, { control_or_variant: "variant" });

  expect(await takeoverIsFirst(page)).toBe(false);
  expect(await testEvents(page)).toEqual([]);
  expect(await page.evaluate(() => document.cookie)).not.toContain(
    "control_or_variant",
  );
});
