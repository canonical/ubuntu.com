import { test, expect } from "@playwright/test";
import { NavigationComponent, NAV_SECTIONS } from "../helpers/navigation";

test.describe("Navigation rendering", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("main navigation header renders with correct classes", async () => {
    await expect(nav.header).toBeVisible();
    await expect(nav.header).toHaveClass(/is-dark/);
  });

  test("logo links to / with text Canonical Ubuntu", async () => {
    await expect(nav.logoLink.first()).toHaveAttribute("href", "/");
    await expect(nav.logoLink.first()).toContainText("Canonical Ubuntu");
  });

  test("dropdown-window container exists with 5 empty content divs", async () => {
    await expect(nav.dropdownWindow).toBeAttached();

    for (const section of NAV_SECTIONS) {
      const contentDiv = nav.sectionContent(section.id);
      await expect(contentDiv).toBeAttached();
      await expect(contentDiv).toHaveClass(/u-hide/);
    }
  });

  test("dropdown-window-overlay exists", async () => {
    await expect(nav.dropdownOverlay).toBeAttached();
  });
});

test.describe("Top-level navigation items", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("all 5 nav items visible with correct text", async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toBeVisible();
      await expect(link).toHaveText(section.label);
    }
  });

  test("nav items have correct href attributes", async () => {
    const expectedHrefs = {
      products: "/navigation#products-navigation",
      "use-case": "/navigation#use-case-navigation",
      support: "/navigation#support-navigation",
      community: "/navigation#community-navigation",
      "download-ubuntu": "/navigation#download-ubuntu-navigation",
    };
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute("href", expectedHrefs[section.id]);
    }
  });

  test("nav items have correct aria-controls attributes", async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute(
        "aria-controls",
        `${section.id}-content`
      );
    }
  });

  test('all links have role="menuitem" and tabindex="0"', async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      await expect(link).toHaveAttribute("role", "menuitem");
      await expect(link).toHaveAttribute("tabindex", "0");
    }
  });
});

test.describe("Dropdown lazy loading", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("hover triggers fetch for each section", async () => {
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

  test("cache prevents re-fetch on second hover", async () => {
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
    let secondFetchTriggered = false;
    nav.page.on("request", (req) => {
      if (req.url().includes("/templates/navigation/products")) {
        secondFetchTriggered = true;
      }
    });
    await productsLink.hover();
    await expect
      .poll(
        () => secondFetchTriggered,
        { timeout: 2000, message: "Expected no second fetch to be triggered" }
      )
      .toBe(false);
  });

  test("focus triggers fetch via onfocus", async () => {
    const fetchPromise = nav.page.waitForRequest((req) =>
      req.url().includes("/templates/navigation/products")
    );
    await nav.sectionLink("products").focus();
    await fetchPromise;
  });

  test("click activates dropdown and shows content", async () => {
    await nav.openDropdown("products");

    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);
    await expect(nav.sectionContent("products")).not.toHaveClass(/u-hide/);
  });
});

test.describe("Dropdown content verification", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("Products side nav tabs match expected list", async () => {
    await nav.openDropdown("products");

    const expectedTabs = [
      "Featured",
      "Ubuntu OS",
      "Private cloud",
      "Public cloud",
      "Virtualization",
      "Security and support",
      "Kubernetes",
      "AI and data",
      "Certified hardware",
      "IoT and edge",
      "Developer tools",
    ];

    const tabLinks = nav.sectionSideNavLinks("products");
    const count = await tabLinks.count();
    expect(count).toBe(expectedTabs.length);
    for (let i = 0; i < expectedTabs.length; i++) {
      await expect(tabLinks.nth(i)).toContainText(expectedTabs[i]);
    }
  });

  test("Products Featured links are visible", async () => {
    await nav.openDropdown("products");

    const keyLinks = [
      "Ubuntu Desktop",
      "Ubuntu Server",
      "Ubuntu Pro",
      "OpenStack",
      "Kubernetes",
      "AI",
    ];
    for (const linkText of keyLinks) {
      await expect(
        nav
          .sectionContent("products")
          .getByRole("link", { name: linkText })
          .first()
      ).toBeVisible();
    }
  });

  test("tab switching works - click Kubernetes tab", async () => {
    await nav.openDropdown("products");

    await nav.sectionSideNavLinkByText("products", "Kubernetes").click();

    await expect(
      nav
        .sectionContent("products")
        .getByRole("link", { name: "MicroK8s" })
        .first()
    ).toBeVisible();
  });

  test("Use cases has correct headings and key links", async () => {
    await nav.openDropdown("use-case");

    await expect(
      nav.sectionContent("use-case").getByText("By solution")
    ).toBeVisible();
    await expect(
      nav.sectionContent("use-case").getByText("By industry")
    ).toBeVisible();

    const keyLinks = ["AI/ML", "IoT", "Automotive"];
    for (const linkText of keyLinks) {
      await expect(
        nav
          .sectionContent("use-case")
          .getByRole("link", { name: linkText })
          .first()
      ).toBeVisible();
    }
  });

  test("Support has Enterprise and Resources tabs", async () => {
    await nav.openDropdown("support");

    await expect(
      nav.sectionSideNavLinkByText("support", "Enterprise")
    ).toBeVisible();
    await expect(
      nav.sectionSideNavLinkByText("support", "Resources")
    ).toBeVisible();
  });

  test("Community has expected tabs", async () => {
    await nav.openDropdown("community");

    const expectedTabs = [
      "Learning resources",
      "Forums",
      "Contribute to Ubuntu",
      "Mission and governance",
      "Keep up to date",
    ];
    for (const tab of expectedTabs) {
      await expect(
        nav.sectionSideNavLinkByText("community", tab)
      ).toBeVisible();
    }
  });

  test("Download Ubuntu has expected tabs", async () => {
    await nav.openDropdown("download-ubuntu");

    const expectedTabs = [
      "Desktop",
      "Server",
      "Raspberry Pi",
      "Ubuntu for IoT",
      "Ubuntu for RISC-V",
      "Develop on Ubuntu",
      "Windows & macOS",
    ];
    for (const tab of expectedTabs) {
      await expect(
        nav.sectionSideNavLinkByText("download-ubuntu", tab)
      ).toBeVisible();
    }
  });
});

test.describe("Link validation in dropdowns", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("Products Featured links have correct hrefs", async () => {
    await nav.openDropdown("products");

    const expectedLinks = [
      { name: "Ubuntu Desktop", href: "/desktop" },
      { name: "Ubuntu Server", href: "/server" },
      { name: "OpenStack", href: "/openstack" },
      { name: "Ubuntu Pro", href: "/pro" },
      { name: "Kubernetes", href: "/kubernetes" },
    ];
    for (const { name, href } of expectedLinks) {
      await expect(
        nav
          .sectionContent("products")
          .getByRole("link", { name })
          .first()
      ).toHaveAttribute("href", href);
    }
  });

  test("Use cases links have correct hrefs", async () => {
    await nav.openDropdown("use-case");

    const expectedLinks = [
      { name: "AI/ML", href: "/ai" },
      { name: "Compliance", href: "/security/security-standards" },
      { name: "Containers", href: "/containers" },
    ];
    for (const { name, href } of expectedLinks) {
      await expect(
        nav
          .sectionContent("use-case")
          .getByRole("link", { name })
          .first()
      ).toHaveAttribute("href", href);
    }
  });

  test("link descriptions are rendered near product links", async () => {
    await nav.openDropdown("products");

    // Use .first() since the description appears in both Featured and Ubuntu OS tabs
    await expect(
      nav
        .sectionContent("products")
        .getByText("Fast, modern and secure Linux")
        .first()
    ).toBeVisible();
  });

  test("Products section footer has Contact us CTA", async () => {
    await nav.openDropdown("products");

    const contactLink = nav
      .sectionContent("products")
      .getByRole("link", { name: "Contact us" });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute("href", "/contact-us");
  });

  test("clicking a dropdown link navigates to the correct page", async () => {
    await nav.openDropdown("products");

    await nav
      .sectionContent("products")
      .getByRole("link", { name: "Ubuntu Desktop" })
      .first()
      .click();

    await expect(nav.page).toHaveURL(/\/desktop/, { timeout: 10000 });
  });
});

test.describe("Search functionality", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("clicking search button opens search", async () => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);
    await expect(nav.searchInput).toBeVisible();
  });

  test("clicking search overlay closes search", async () => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);

    await nav.closeSearchViaOverlay();
    await expect(nav.headerEl).not.toHaveClass(/has-search-open/);
  });

  test("pressing Escape closes search", async () => {
    await nav.openSearch();
    await expect(nav.headerEl).toHaveClass(/has-search-open/);

    await nav.page.keyboard.press("Escape");
    await expect(nav.headerEl).not.toHaveClass(/has-search-open/);
  });

  test("submitting search navigates to search results", async () => {
    await nav.openSearch();
    await nav.searchInput.fill("kubernetes");
    await nav.searchInput.press("Enter");

    await nav.page.waitForURL(/\/search\?q=kubernetes/, { timeout: 10000 });
    expect(nav.page.url()).toContain("/search?q=kubernetes");
  });

  test("search form has correct action", async () => {
    await expect(nav.searchForm).toHaveAttribute("action", "/search");
  });

  test("reset button clears search input", async () => {
    await nav.openSearch();
    await nav.searchInput.fill("kubernetes");
    await expect(nav.searchInput).toHaveValue("kubernetes");

    await nav.searchResetButton.click();
    await expect(nav.searchInput).toHaveValue("");
  });
});

test.describe("Mobile menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("menu button is visible with text Menu", async () => {
    await expect(nav.mobileMenuButton).toBeVisible();
    await expect(nav.mobileMenuButton).toHaveText("Menu");
  });

  test("clicking menu button toggles has-menu-open class", async () => {
    await nav.openMobileMenu();
    await expect(nav.headerEl).toHaveClass(/has-menu-open/);
  });

  test("clicking menu button again closes menu", async () => {
    await nav.openMobileMenu();
    await expect(nav.headerEl).toHaveClass(/has-menu-open/);

    await nav.closeMobileMenu();
    await expect(nav.headerEl).not.toHaveClass(/has-menu-open/);
  });

  test("Escape key closes mobile menu", async () => {
    await nav.openMobileMenu();
    await expect(nav.headerEl).toHaveClass(/has-menu-open/);

    await nav.page.keyboard.press("Escape");
    await expect(nav.headerEl).not.toHaveClass(/has-menu-open/);
  });

  test("tapping a nav item reveals its mobile sub-options", async () => {
    await nav.openMobileMenu();
    await nav.sectionLink("products").click();

    const mobileDropdown = nav.page.locator("#products-content-mobile");
    await expect(mobileDropdown).toHaveAttribute("aria-hidden", "false", {
      timeout: 10000,
    });
  });
});

test.describe("Secondary navigation", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
  });

  test("/azure page shows secondary navigation with title Azure", async () => {
    await nav.goto("/azure");

    await expect(nav.secondaryNav).toBeVisible();
    await expect(nav.secondaryNavTitle).toContainText("Azure");
  });

  test("/azure page has expected child items", async () => {
    await nav.goto("/azure");

    const expectedItems = ["Pro", "Support", "FIPS", "SQL", "Docs"];
    for (const item of expectedItems) {
      await expect(
        nav.secondaryNav.getByRole("link", { name: item }).first()
      ).toBeAttached();
    }
  });

  test("/azure/pro shows Pro as selected with aria-current", async () => {
    await nav.goto("/azure/pro");

    await expect(nav.secondaryNavSelectedItem).toContainText("Pro");
    await expect(nav.secondaryNavSelectedItem.locator("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("/pro page shows secondary nav with title Ubuntu Pro", async () => {
    await nav.goto("/pro");

    await expect(nav.secondaryNav).toBeVisible();
    await expect(nav.secondaryNavTitle).toContainText("Ubuntu\u00a0Pro");
  });

  test("/openstack page shows secondary nav with OpenStack branding", async () => {
    await nav.goto("/openstack");

    await expect(nav.secondaryNav).toBeVisible();
    await expect(nav.secondaryNavTitle).toContainText("OpenStack");
  });

  test("homepage does not show secondary navigation", async () => {
    await nav.goto("/");

    await expect(nav.secondaryNav).not.toBeAttached();
  });

  test("section page shows mobile toggle button", async () => {
    await nav.goto("/azure");

    await expect(nav.secondaryNavToggle).toBeAttached();
  });
});

test.describe("Keyboard navigation & accessibility", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("Tab cycles through nav items in sequence", async () => {
    await nav.sectionLink("products").focus();
    await expect(nav.sectionLink("products")).toBeFocused();

    await nav.page.keyboard.press("Tab");
    await expect(nav.sectionLink("use-case")).toBeFocused();

    await nav.page.keyboard.press("Tab");
    await expect(nav.sectionLink("support")).toBeFocused();
  });

  test("Enter key opens dropdown on focused nav item", async () => {
    // Hover first to trigger fetch, then focus and press Enter
    const link = nav.sectionLink("products");
    await link.hover();
    await nav
      .sectionContent("products")
      .locator("*")
      .first()
      .waitFor({ state: "attached", timeout: 10000 });

    await link.focus();
    await nav.page.keyboard.press("Enter");
    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);
  });

  test("Escape closes open dropdown", async () => {
    await nav.openDropdown("products");

    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);
    // Focus inside the dropdown content, then Escape should close
    await nav.sectionContent("products").locator("a").first().focus();
    await nav.page.keyboard.press("Escape");
    // May need second escape to fully close from side tabs level
    await nav.page.keyboard.press("Escape");
    await expect(nav.sectionItem("products")).not.toHaveClass(/is-active/);
  });

  test("all 5 nav links have tabindex=0", async () => {
    for (const section of NAV_SECTIONS) {
      await expect(nav.sectionLink(section.id)).toHaveAttribute(
        "tabindex",
        "0"
      );
    }
  });
});

test.describe("Dropdown overlay & edge cases", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
  });

  test("clicking overlay closes active dropdown", async () => {
    await nav.goto("/");
    await nav.openDropdown("products");

    await expect(nav.dropdownWindow).toHaveClass(/is-active/);
    await nav.dropdownOverlay.click({ force: true });
    await expect(nav.dropdownWindow).not.toHaveClass(/is-active/);
  });

  test("opening one dropdown closes another", async () => {
    await nav.goto("/");
    await nav.openDropdown("products");
    await expect(nav.sectionItem("products")).toHaveClass(/is-active/);

    await nav.openDropdown("use-case");
    await expect(nav.sectionItem("use-case")).toHaveClass(/is-active/);
    await expect(nav.sectionItem("products")).not.toHaveClass(/is-active/);
  });

  test("/azure page header has is-reduced class", async () => {
    await nav.goto("/azure");
    await expect(nav.headerEl).toHaveClass(/is-reduced/);
  });

  test("homepage header does NOT have is-reduced class", async () => {
    await nav.goto("/");
    await expect(nav.headerEl).not.toHaveClass(/is-reduced/);
  });
});

test.describe("Navigation on error pages", () => {
  test("navigation header renders on a 404 page", async ({ page }) => {
    const nav = new NavigationComponent(page);
    await nav.goto("/this-page-does-not-exist-404-test");

    await expect(nav.header).toBeVisible();
    for (const section of NAV_SECTIONS) {
      await expect(nav.sectionLink(section.id)).toBeVisible();
    }
  });
});

test.describe("Responsive navigation", () => {
  const viewports = [
    { name: "mobile", width: 375, height: 812 },
    { name: "tablet", width: 768, height: 1024 },
    { name: "desktop", width: 1280, height: 800 },
  ];

  for (const { name, width, height } of viewports) {
    test(`navigation is functional at ${name} (${width}px)`, async ({
      page,
    }) => {
      await page.setViewportSize({ width, height });
      const nav = new NavigationComponent(page);
      await nav.goto("/");

      await expect(nav.header).toBeVisible();

      if (width <= 768) {
        await expect(nav.mobileMenuButton).toBeVisible();
      } else {
        for (const section of NAV_SECTIONS) {
          await expect(nav.sectionLink(section.id)).toBeVisible();
        }
      }
    });
  }
});

test.describe("ARIA relationship between menu items and content", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("aria-controls target becomes visible when dropdown opens and hidden when closed", async () => {
    const link = nav.sectionLink("products");
    const ariaControls = await link.getAttribute("aria-controls");
    expect(ariaControls).toBe("products-content");

    const controlledContent = nav.page.locator(`#${ariaControls}`);
    await expect(controlledContent).toHaveClass(/u-hide/);

    await nav.openDropdown("products");
    await expect(controlledContent).not.toHaveClass(/u-hide/);

    await nav.dropdownOverlay.click({ force: true });
    await expect(controlledContent).toHaveClass(/u-hide/);
  });
});

test.describe("Dropdown response performance", () => {
  let nav: NavigationComponent;

  test.beforeEach(async ({ page }) => {
    nav = new NavigationComponent(page);
    await nav.goto("/");
  });

  test("each dropdown endpoint responds in < 3000ms", async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      const start = Date.now();
      const responsePromise = nav.page.waitForResponse((res) =>
        res.url().includes(section.endpoint)
      );
      await link.hover();
      const response = await responsePromise;
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(3000);
      expect(response.status()).toBe(200);
    }
  });

  test("each dropdown response contains .desktop-dropdown-content", async () => {
    for (const section of NAV_SECTIONS) {
      const link = nav.sectionLink(section.id);
      const responsePromise = nav.page.waitForResponse((res) =>
        res.url().includes(section.endpoint)
      );
      await link.hover();
      const response = await responsePromise;
      const body = await response.text();
      expect(body).toContain("desktop-dropdown-content");
    }
  });
});
