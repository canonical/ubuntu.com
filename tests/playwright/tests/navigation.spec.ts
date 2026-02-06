import { test, expect } from "@playwright/test";
import { acceptCookiePolicy } from "../helpers/commands";

const NAV_SECTIONS = [
  {
    id: "products",
    label: "Products",
    endpoint: "/templates/navigation/products",
  },
  {
    id: "use-case",
    label: "Use cases",
    endpoint: "/templates/navigation/use-case",
  },
  {
    id: "support",
    label: "Support",
    endpoint: "/templates/navigation/support",
  },
  {
    id: "community",
    label: "Community",
    endpoint: "/templates/navigation/community",
  },
  {
    id: "download-ubuntu",
    label: "Download Ubuntu",
    endpoint: "/templates/navigation/download-ubuntu",
  },
];

async function openDropdown(page, sectionId: string) {
  const link = page.locator(`#${sectionId} a.p-navigation__link`);
  await link.hover();
  await page
    .locator(`#${sectionId}-content`)
    .locator("*")
    .first()
    .waitFor({ state: "attached", timeout: 10000 });
  await link.click();
  await expect(page.locator(`#${sectionId}`)).toHaveClass(/is-active/);
}

test.describe("Navigation rendering", () => {
  test("main navigation header renders with correct classes", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    const header = page.locator("header#navigation.p-navigation--sliding");
    await expect(header).toBeVisible();
    await expect(header).toHaveClass(/is-dark/);
  });

  test("logo links to / with text Canonical Ubuntu", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    const logoLink = page.locator(
      ".p-navigation__tagged-logo a.p-navigation__link"
    );
    await expect(logoLink.first()).toHaveAttribute("href", "/");
    await expect(logoLink.first()).toContainText("Canonical Ubuntu");
  });

  test("dropdown-window container exists with 5 empty content divs", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    const dropdownWindow = page.locator(".dropdown-window");
    await expect(dropdownWindow).toBeAttached();

    for (const section of NAV_SECTIONS) {
      const contentDiv = page.locator(`#${section.id}-content`);
      await expect(contentDiv).toBeAttached();
      await expect(contentDiv).toHaveClass(/u-hide/);
    }
  });

  test("dropdown-window-overlay exists", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await expect(page.locator(".dropdown-window-overlay")).toBeAttached();
  });
});

test.describe("Top-level navigation items", () => {
  test("all 5 nav items visible with correct text", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    for (const section of NAV_SECTIONS) {
      const link = page.locator(`#${section.id} a.p-navigation__link`);
      await expect(link).toBeVisible();
      await expect(link).toHaveText(section.label);
    }
  });

  test("nav items have correct href attributes", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    const expectedHrefs = {
      products: "/navigation#products-navigation",
      "use-case": "/navigation#use-case-navigation",
      support: "/navigation#support-navigation",
      community: "/navigation#community-navigation",
      "download-ubuntu": "/navigation#download-ubuntu-navigation",
    };
    for (const section of NAV_SECTIONS) {
      const link = page.locator(`#${section.id} a.p-navigation__link`);
      await expect(link).toHaveAttribute("href", expectedHrefs[section.id]);
    }
  });

  test("nav items have correct aria-controls attributes", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    for (const section of NAV_SECTIONS) {
      const link = page.locator(`#${section.id} a.p-navigation__link`);
      await expect(link).toHaveAttribute(
        "aria-controls",
        `${section.id}-content`
      );
    }
  });

  test('all links have role="menuitem" and tabindex="0"', async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    for (const section of NAV_SECTIONS) {
      const link = page.locator(`#${section.id} a.p-navigation__link`);
      await expect(link).toHaveAttribute("role", "menuitem");
      await expect(link).toHaveAttribute("tabindex", "0");
    }
  });
});

test.describe("Dropdown lazy loading", () => {
  test("hover triggers fetch for each section", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    for (const section of NAV_SECTIONS) {
      const link = page.locator(`#${section.id} a.p-navigation__link`);
      const responsePromise = page.waitForRequest((req) =>
        req.url().includes(section.endpoint)
      );
      await link.hover();
      await responsePromise;
      await page
        .locator(`#${section.id}-content`)
        .locator("*")
        .first()
        .waitFor({ state: "attached", timeout: 10000 });
    }
  });

  test("cache prevents re-fetch on second hover", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    const productsLink = page.locator("#products a.p-navigation__link");

    // First hover triggers fetch
    const firstFetch = page.waitForRequest((req) =>
      req.url().includes("/templates/navigation/products")
    );
    await productsLink.hover();
    await firstFetch;
    await page
      .locator("#products-content")
      .locator("*")
      .first()
      .waitFor({ state: "attached", timeout: 10000 });

    // Hover away
    await page.locator(".p-navigation__banner").hover();

    // Second hover should NOT trigger fetch
    let secondFetchTriggered = false;
    page.on("request", (req) => {
      if (req.url().includes("/templates/navigation/products")) {
        secondFetchTriggered = true;
      }
    });
    await productsLink.hover();
    // Give a brief moment for any request to fire
    await page.waitForTimeout(1000);
    expect(secondFetchTriggered).toBe(false);
  });

  test("focus triggers fetch via onfocus", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    const fetchPromise = page.waitForRequest((req) =>
      req.url().includes("/templates/navigation/products")
    );
    await page.locator("#products a.p-navigation__link").focus();
    await fetchPromise;
  });

  test("click activates dropdown and shows content", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

    await expect(page.locator("#products")).toHaveClass(/is-active/);
    await expect(page.locator("#products-content")).not.toHaveClass(/u-hide/);
  });
});

test.describe("Dropdown content verification", () => {
  test("Products side nav tabs match expected list", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

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

    const tabLinks = page.locator(
      "#products-content .p-side-navigation__link"
    );
    const count = await tabLinks.count();
    expect(count).toBe(expectedTabs.length);
    for (let i = 0; i < expectedTabs.length; i++) {
      await expect(tabLinks.nth(i)).toContainText(expectedTabs[i]);
    }
  });

  test("Products Featured links are visible", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

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
        page
          .locator("#products-content")
          .getByRole("link", { name: linkText })
          .first()
      ).toBeVisible();
    }
  });

  test("tab switching works - click Kubernetes tab", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

    const k8sTab = page.locator(
      '#products-content .p-side-navigation__link:has-text("Kubernetes")'
    );
    await k8sTab.click();

    await expect(
      page
        .locator("#products-content")
        .getByRole("link", { name: "MicroK8s" })
        .first()
    ).toBeVisible();
  });

  test("Use cases has correct headings and key links", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "use-case");

    await expect(
      page.locator("#use-case-content").getByText("By solution")
    ).toBeVisible();
    await expect(
      page.locator("#use-case-content").getByText("By industry")
    ).toBeVisible();

    const keyLinks = ["AI/ML", "IoT", "Automotive"];
    for (const linkText of keyLinks) {
      await expect(
        page
          .locator("#use-case-content")
          .getByRole("link", { name: linkText })
          .first()
      ).toBeVisible();
    }
  });

  test("Support has Enterprise and Resources tabs", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "support");

    await expect(
      page.locator(
        '#support-content .p-side-navigation__link:has-text("Enterprise")'
      )
    ).toBeVisible();
    await expect(
      page.locator(
        '#support-content .p-side-navigation__link:has-text("Resources")'
      )
    ).toBeVisible();
  });

  test("Community has expected tabs", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "community");

    const expectedTabs = [
      "Learning resources",
      "Forums",
      "Contribute to Ubuntu",
      "Mission and governance",
      "Keep up to date",
    ];
    for (const tab of expectedTabs) {
      await expect(
        page.locator(
          `#community-content .p-side-navigation__link:has-text("${tab}")`
        )
      ).toBeVisible();
    }
  });

  test("Download Ubuntu has expected tabs", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "download-ubuntu");

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
        page.locator(
          `#download-ubuntu-content .p-side-navigation__link:has-text("${tab}")`
        )
      ).toBeVisible();
    }
  });
});

test.describe("Link validation in dropdowns", () => {
  test("Products Featured links have correct hrefs", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

    const expectedLinks = [
      { name: "Ubuntu Desktop", href: "/desktop" },
      { name: "Ubuntu Server", href: "/server" },
      { name: "OpenStack", href: "/openstack" },
      { name: "Ubuntu Pro", href: "/pro" },
      { name: "Kubernetes", href: "/kubernetes" },
    ];
    for (const { name, href } of expectedLinks) {
      await expect(
        page
          .locator("#products-content")
          .getByRole("link", { name })
          .first()
      ).toHaveAttribute("href", href);
    }
  });

  test("Use cases links have correct hrefs", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "use-case");

    const expectedLinks = [
      { name: "AI/ML", href: "/ai" },
      { name: "Compliance", href: "/security/security-standards" },
      { name: "Containers", href: "/containers" },
    ];
    for (const { name, href } of expectedLinks) {
      await expect(
        page
          .locator("#use-case-content")
          .getByRole("link", { name })
          .first()
      ).toHaveAttribute("href", href);
    }
  });

  test("link descriptions are rendered near product links", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

    // Use .first() since the description appears in both Featured and Ubuntu OS tabs
    await expect(
      page
        .locator("#products-content")
        .getByText("Fast, modern and secure Linux")
        .first()
    ).toBeVisible();
  });

  test("Products section footer has Contact us CTA", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

    const contactLink = page
      .locator("#products-content")
      .getByRole("link", { name: "Contact us" });
    await expect(contactLink).toBeVisible();
    await expect(contactLink).toHaveAttribute("href", "/contact-us");
  });
});

test.describe("Search functionality", () => {
  test("clicking search button opens search", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    // Use the search button inside the nav (desktop), not the mobile one in banner
    await page
      .locator("nav.p-navigation__nav .js-search-button")
      .click({ force: true });
    await expect(page.locator("header#navigation")).toHaveClass(
      /has-search-open/
    );
    await expect(page.locator('input[name="q"]')).toBeVisible();
  });

  test("clicking search overlay closes search", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    await page
      .locator("nav.p-navigation__nav .js-search-button")
      .click({ force: true });
    await expect(page.locator("header#navigation")).toHaveClass(
      /has-search-open/
    );

    await page.locator(".p-navigation__search-overlay").click({ force: true });
    await expect(page.locator("header#navigation")).not.toHaveClass(
      /has-search-open/
    );
  });

  test("pressing Escape closes search", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    await page
      .locator("nav.p-navigation__nav .js-search-button")
      .click({ force: true });
    await expect(page.locator("header#navigation")).toHaveClass(
      /has-search-open/
    );

    await page.keyboard.press("Escape");
    await expect(page.locator("header#navigation")).not.toHaveClass(
      /has-search-open/
    );
  });

  test("submitting search navigates to search results", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    await page
      .locator("nav.p-navigation__nav .js-search-button")
      .click({ force: true });
    await page.locator('input[name="q"]').fill("kubernetes");
    await page.locator('input[name="q"]').press("Enter");

    await page.waitForURL(/\/search\?q=kubernetes/, { timeout: 10000 });
    expect(page.url()).toContain("/search?q=kubernetes");
  });

  test("search form has correct action", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    const searchForm = page.locator("form.js-search-form");
    await expect(searchForm).toHaveAttribute("action", "/search");
  });
});

test.describe("Mobile menu", () => {
  test.use({ viewport: { width: 375, height: 812 } });

  test("menu button is visible with text Menu", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    const menuButton = page.locator(".js-menu-button");
    await expect(menuButton).toBeVisible();
    await expect(menuButton).toHaveText("Menu");
  });

  test("clicking menu button toggles has-menu-open class", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    await page.locator(".js-menu-button").click();
    await expect(page.locator("header#navigation")).toHaveClass(
      /has-menu-open/
    );
  });

  test("clicking menu button again closes menu", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    await page.locator(".js-menu-button").click();
    await expect(page.locator("header#navigation")).toHaveClass(
      /has-menu-open/
    );

    await page.locator(".js-menu-button").click();
    await expect(page.locator("header#navigation")).not.toHaveClass(
      /has-menu-open/
    );
  });

  test("Escape key closes mobile menu", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    await page.locator(".js-menu-button").click();
    await expect(page.locator("header#navigation")).toHaveClass(
      /has-menu-open/
    );

    await page.keyboard.press("Escape");
    await expect(page.locator("header#navigation")).not.toHaveClass(
      /has-menu-open/
    );
  });
});

test.describe("Secondary navigation", () => {
  test("/azure page shows secondary navigation with title Azure", async ({
    page,
  }) => {
    await page.goto("/azure");
    await acceptCookiePolicy(page);

    const secondaryNav = page.locator("#secondary-navigation");
    await expect(secondaryNav).toBeVisible();
    await expect(
      secondaryNav.locator(".p-navigation__logo-title")
    ).toContainText("Azure");
  });

  test("/azure page has expected child items", async ({ page }) => {
    await page.goto("/azure");
    await acceptCookiePolicy(page);

    const expectedItems = ["Pro", "Support", "FIPS", "SQL", "Docs"];
    for (const item of expectedItems) {
      await expect(
        page
          .locator("#secondary-navigation")
          .getByRole("link", { name: item })
          .first()
      ).toBeAttached();
    }
  });

  test("/azure/pro shows Pro as selected with aria-current", async ({
    page,
  }) => {
    await page.goto("/azure/pro");
    await acceptCookiePolicy(page);

    const selectedItem = page.locator(
      "#secondary-navigation .p-navigation__item.is-selected"
    );
    await expect(selectedItem).toContainText("Pro");
    await expect(selectedItem.locator("a")).toHaveAttribute(
      "aria-current",
      "page"
    );
  });

  test("/pro page shows secondary nav with title Ubuntu Pro", async ({
    page,
  }) => {
    await page.goto("/pro");
    await acceptCookiePolicy(page);

    const secondaryNav = page.locator("#secondary-navigation");
    await expect(secondaryNav).toBeVisible();
    await expect(
      secondaryNav.locator(".p-navigation__logo-title")
    ).toContainText("Ubuntu\u00a0Pro");
  });

  test("/openstack page shows secondary nav with OpenStack branding", async ({
    page,
  }) => {
    await page.goto("/openstack");
    await acceptCookiePolicy(page);

    const secondaryNav = page.locator("#secondary-navigation");
    await expect(secondaryNav).toBeVisible();
    await expect(
      secondaryNav.locator(".p-navigation__logo-title")
    ).toContainText("OpenStack");
  });

  test("homepage does not show secondary navigation", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    await expect(page.locator("#secondary-navigation")).not.toBeAttached();
  });

  test("section page shows mobile toggle button", async ({ page }) => {
    await page.goto("/azure");
    await acceptCookiePolicy(page);

    await expect(
      page.locator("#secondary-navigation .p-navigation__toggle--open")
    ).toBeAttached();
  });
});

test.describe("Keyboard navigation & accessibility", () => {
  test("Tab cycles through nav items in sequence", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    // Focus the first nav link
    await page.locator("#products a.p-navigation__link").focus();
    await expect(
      page.locator("#products a.p-navigation__link")
    ).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.locator("#use-case a.p-navigation__link")
    ).toBeFocused();

    await page.keyboard.press("Tab");
    await expect(
      page.locator("#support a.p-navigation__link")
    ).toBeFocused();
  });

  test("Enter key opens dropdown on focused nav item", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    // Hover first to trigger fetch, then focus and press Enter
    const link = page.locator("#products a.p-navigation__link");
    await link.hover();
    await page
      .locator("#products-content")
      .locator("*")
      .first()
      .waitFor({ state: "attached", timeout: 10000 });

    await link.focus();
    await page.keyboard.press("Enter");
    await expect(page.locator("#products")).toHaveClass(/is-active/);
  });

  test("Escape closes open dropdown", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

    await expect(page.locator("#products")).toHaveClass(/is-active/);
    // Focus inside the dropdown content, then Escape should close
    await page.locator("#products-content a").first().focus();
    await page.keyboard.press("Escape");
    // May need second escape to fully close from side tabs level
    await page.keyboard.press("Escape");
    await expect(page.locator("#products")).not.toHaveClass(/is-active/);
  });

  test("all 5 nav links have tabindex=0", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    for (const section of NAV_SECTIONS) {
      await expect(
        page.locator(`#${section.id} a.p-navigation__link`)
      ).toHaveAttribute("tabindex", "0");
    }
  });
});

test.describe("Dropdown overlay & edge cases", () => {
  test("clicking overlay closes active dropdown", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");

    await expect(page.locator(".dropdown-window")).toHaveClass(/is-active/);
    await page.locator(".dropdown-window-overlay").click({ force: true });
    await expect(page.locator(".dropdown-window")).not.toHaveClass(/is-active/);
  });

  test("opening one dropdown closes another", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await openDropdown(page, "products");
    await expect(page.locator("#products")).toHaveClass(/is-active/);

    await openDropdown(page, "use-case");
    await expect(page.locator("#use-case")).toHaveClass(/is-active/);
    await expect(page.locator("#products")).not.toHaveClass(/is-active/);
  });

  test("/azure page header has is-reduced class", async ({ page }) => {
    await page.goto("/azure");
    await acceptCookiePolicy(page);
    await expect(page.locator("header#navigation")).toHaveClass(/is-reduced/);
  });

  test("homepage header does NOT have is-reduced class", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);
    await expect(page.locator("header#navigation")).not.toHaveClass(
      /is-reduced/
    );
  });
});

test.describe("Dropdown response performance", () => {
  test("each dropdown endpoint responds in < 3000ms", async ({ page }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    for (const section of NAV_SECTIONS) {
      const link = page.locator(`#${section.id} a.p-navigation__link`);
      const start = Date.now();
      const responsePromise = page.waitForResponse((res) =>
        res.url().includes(section.endpoint)
      );
      await link.hover();
      const response = await responsePromise;
      const elapsed = Date.now() - start;
      expect(elapsed).toBeLessThan(3000);
      expect(response.status()).toBe(200);
    }
  });

  test("each dropdown response contains .desktop-dropdown-content", async ({
    page,
  }) => {
    await page.goto("/");
    await acceptCookiePolicy(page);

    for (const section of NAV_SECTIONS) {
      const link = page.locator(`#${section.id} a.p-navigation__link`);
      const responsePromise = page.waitForResponse((res) =>
        res.url().includes(section.endpoint)
      );
      await link.hover();
      const response = await responsePromise;
      const body = await response.text();
      expect(body).toContain("desktop-dropdown-content");
    }
  });
});
