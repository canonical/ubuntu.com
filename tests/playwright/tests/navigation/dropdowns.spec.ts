import { test, expect } from "@playwright/test";
import { NavigationComponent, NAV_SECTIONS } from "../../helpers/navigation";

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
