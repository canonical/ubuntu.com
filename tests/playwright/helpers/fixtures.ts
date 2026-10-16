import { test as base } from "@playwright/test";
import { NavigationComponent } from "./navigation";
import { blockExternalRequests } from "./network";

type E2EFixtures = {
  nav: NavigationComponent;
};

export const test = base.extend<E2EFixtures>({
  context: async ({ context, baseURL }, use) => {
    await blockExternalRequests(context, baseURL);
    await use(context);
  },
  nav: async ({ page }, use) => {
    const nav = new NavigationComponent(page);
    await nav.goto("/");
    await use(nav);
  },
});

export { expect } from "@playwright/test";
