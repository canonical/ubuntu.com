import { test, expect } from "../../helpers/fixtures";
import { NavigationComponent, NAV_SECTIONS } from "../../helpers/navigation";
import {
  getSideNavTitles,
  getPrimaryLinks,
  getFlatPrimaryLinks,
  getFlatSecondaryLinks,
  getSectionFooter,
} from "../../helpers/navigation-data";

test.describe("Dropdown lazy loading", () => {
  test("hover triggers fetch for each section", async ({ nav }) => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      const responsePromise = nav.page.waitForRequest((req) =>
        req.url().includes(section.endpoint)
      );
      await link.hover();
      await responsePromise;
      await nav
        .sectionContent(section.id)
        .locator("*")
        .first()
        .waitFor({ state: "attached", timeout: 10000 });
    }
  });

  test("cache prevents re-fetch on second hover", async ({ nav }) => {
    const productsLink = nav.sectionLink("products");

    // First hover triggers fetch
    const firstFetch = nav.page.waitForRequest((req) =>
      req.url().includes("/templates/navigation/products")
    );
    await productsLink.hover();
    await firstFetch;
    await nav
      .sectionContent("products")
      .locator("*")
      .first()
      .waitFor({ state: "attached", timeout: 10000 });

    // Hover away
    await nav.banner.hover();

    // Second hover should NOT trigger fetch
    await productsLink.hover();
    await expect(
      nav.page.waitForRequest(
        (req) => req.url().includes("/templates/navigation/products"),
        { timeout: 2000 }
      )
    ).rejects.toThrow();
  });

  test("focus triggers fetch via onfocus", async ({ nav }) => {
    const fetchPromise = nav.page.waitForRequest((req) =>
      req.url().includes("/templates/navigation/products")
    );
    await nav.sectionLink("products").focus();
    await fetchPromise;
  });

  test("click activates dropdown and shows content", async ({ nav }) => {
    await nav.openDropdown("products");

    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);
    await expect(nav.sectionContent("products")).not.toHaveClass(/u-hide/);
  });
});

test.describe("Dropdown content verification", () => {
  test("Products side nav tabs match expected list", async ({ nav }) => {
    await nav.openDropdown("products");

    const expectedTabs = getSideNavTitles("products");

    const tabLinks = nav.sectionSideNavLinks("products");
    const count = await tabLinks.count();
    expect(count).toBe(expectedTabs.length);
    for (let i = 0; i < expectedTabs.length; i++) {
      await expect(tabLinks.nth(i)).toContainText(expectedTabs[i]);
    }
  });

  test("Products Featured links are visible", async ({ nav }) => {
    await nav.openDropdown("products");

    const featuredLinks = getPrimaryLinks("products", "Featured");
    const keyLinks = featuredLinks.slice(0, 6).map((l) => l.title);
    for (const linkText of keyLinks) {
      await expect(
        nav
          .sectionContent("products")
          .getByRole("link", { name: linkText })
          .first()
      ).toBeVisible();
    }
  });

  test("tab switching works - click Kubernetes tab", async ({ nav }) => {
    await nav.openDropdown("products");

    const k8sLinks = getPrimaryLinks("products", "Kubernetes");
    const firstLink = k8sLinks[0].title;

    await nav.sectionSideNavLinkByText("products", "Kubernetes").click();

    await expect(
      nav
        .sectionContent("products")
        .getByRole("link", { name: firstLink })
        .first()
    ).toBeVisible();
  });

  test("Use cases has correct headings and key links", async ({ nav }) => {
    await nav.openDropdown("use-case");

    const primaryGroups = getFlatPrimaryLinks("use-case");
    const secondaryGroups = getFlatSecondaryLinks("use-case");

    for (const group of primaryGroups) {
      if (group.groupTitle) {
        await expect(
          nav.sectionContent("use-case").getByText(group.groupTitle)
        ).toBeVisible();
      }
    }
    for (const group of secondaryGroups) {
      if (group.groupTitle) {
        await expect(
          nav.sectionContent("use-case").getByText(group.groupTitle)
        ).toBeVisible();
      }
    }

    const primaryCheckLinks = primaryGroups[0].links.slice(0, 2).map((l) => l.title);
    const secondaryCheckLinks = secondaryGroups[0].links.slice(0, 1).map((l) => l.title);
    const spotCheckLinks = [...primaryCheckLinks, ...secondaryCheckLinks];
    for (const linkText of spotCheckLinks) {
      await expect(
        nav
          .sectionContent("use-case")
          .getByRole("link", { name: linkText })
          .first()
      ).toBeVisible();
    }
  });

  const sectionsWithTabs = ["support", "community", "download-ubuntu"] as const;

  for (const sectionId of sectionsWithTabs) {
    test(`${sectionId} has expected tabs`, async ({ nav }) => {
      await nav.openDropdown(sectionId);
      const expectedTabs = getSideNavTitles(sectionId);

      for (const tab of expectedTabs) {
        await expect(nav.sectionSideNavLinkByText(sectionId, tab)).toBeVisible();
      }
    });
  }
});

test.describe("Link validation in dropdowns", () => {
  test("Products Featured links have correct hrefs", async ({ nav }) => {
    await nav.openDropdown("products");

    const featuredLinks = getPrimaryLinks("products", "Featured");
    const expectedLinks = featuredLinks
      .filter((l) => l.url.startsWith("/"))
      .slice(0, 5)
      .map((l) => ({ name: l.title, href: l.url }));
    for (const { name, href } of expectedLinks) {
      await expect(
        nav
          .sectionContent("products")
          .getByRole("link", { name })
          .first()
      ).toHaveAttribute("href", href);
    }
  });

  test("Use cases links have correct hrefs", async ({ nav }) => {
    await nav.openDropdown("use-case");

    const primaryGroups = getFlatPrimaryLinks("use-case");
    const expectedLinks = primaryGroups[0].links
      .filter((l) => l.url.startsWith("/"))
      .slice(0, 3)
      .map((l) => ({ name: l.title, href: l.url }));
    for (const { name, href } of expectedLinks) {
      await expect(
        nav
          .sectionContent("use-case")
          .getByRole("link", { name })
          .first()
      ).toHaveAttribute("href", href);
    }
  });

  test("link descriptions are rendered near product links", async ({ nav }) => {
    await nav.openDropdown("products");

    const firstDescription = getPrimaryLinks("products", "Featured")[0].description!;
    // Use .first() since the description appears in both Featured and Ubuntu OS tabs
    await expect(
      nav
        .sectionContent("products")
        .getByText(firstDescription)
        .first()
    ).toBeVisible();
  });

  test("Products section footer has CTA", async ({ nav }) => {
    await nav.openDropdown("products");

    const footer = getSectionFooter("products", "Featured");
    const ctaLink = nav
      .sectionContent("products")
      .getByRole("link", { name: footer.cta_title });
    await expect(ctaLink).toBeVisible();
    await expect(ctaLink).toHaveAttribute("href", footer.cta_url);
  });

  test("clicking a dropdown link navigates to the correct page", async ({ nav }) => {
    await nav.openDropdown("products");

    await nav
      .sectionContent("products")
      .getByRole("link", { name: "Ubuntu Desktop" })
      .first()
      .click();

    await expect(nav.page).toHaveURL(/\/desktop/, { timeout: 10000 });
  });
});

test.describe("Dropdown overlay & edge cases", () => {
  test("clicking overlay closes active dropdown", async ({ nav }) => {
    await nav.openDropdown("products");

    await expect(nav.dropdownWindow).toHaveClass(/is-active/);
    await nav.dropdownOverlay.click();
    await expect(nav.dropdownWindow).not.toHaveClass(/is-active/);
  });

  test("opening one dropdown closes another", async ({ nav }) => {
    await nav.openDropdown("products");
    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);

    await nav.openDropdown("use-case");
    await expect(nav.sectionItem("use-case")).toHaveClass(/is-active/);
    await expect(nav.sectionItem("products")).not.toHaveClass(/is-active/);
  });

  test("/azure page header has is-reduced class", async ({ page }) => {
    const nav = new NavigationComponent(page);
    await nav.goto("/azure");
    await expect(nav.headerEl).toHaveClass(/is-reduced/);
  });

  test("homepage header does NOT have is-reduced class", async ({ nav }) => {
    await expect(nav.headerEl).not.toHaveClass(/is-reduced/);
  });
});
