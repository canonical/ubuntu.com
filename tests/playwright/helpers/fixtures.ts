import { test as base } from "@playwright/test";
import { NavigationComponent } from "./navigation";

type E2EFixtures = {
  nav: NavigationComponent;
};

export const test = base.extend<E2EFixtures>({
  nav: async ({ page }, use) => {
    const nav = new NavigationComponent(page);
    await nav.goto("/");
    await use(nav);
  },
});

export { expect } from "@playwright/test";
