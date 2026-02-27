import { Page, Locator, expect } from "@playwright/test";
import { acceptCookiePolicy } from "./commands";

export const NAV_SECTIONS = [
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
] as const;

export class NavigationComponent {
  readonly page: Page;

  // Header
  readonly header: Locator;
  readonly headerEl: Locator;
  readonly logoLink: Locator;

  // Dropdown
  readonly dropdownWindow: Locator;
  readonly dropdownOverlay: Locator;

  // Banner
  readonly banner: Locator;

  // Search
  readonly searchButton: Locator;
  readonly searchInput: Locator;
  readonly searchResetButton: Locator;
  readonly searchOverlay: Locator;
  readonly searchForm: Locator;

  // Mobile
  readonly mobileMenuButton: Locator;

  // Secondary navigation
  readonly secondaryNav: Locator;
  readonly secondaryNavTitle: Locator;
  readonly secondaryNavSelectedItem: Locator;
  readonly secondaryNavToggle: Locator;

  constructor(page: Page) {
    this.page = page;

    this.header = page.locator("header#navigation.p-navigation--sliding");
    this.headerEl = page.locator("header#navigation");
    this.logoLink = page.locator(
      "header#navigation .p-navigation__tagged-logo a.p-navigation__link"
    );

    this.dropdownWindow = page.locator(".dropdown-window");
    this.dropdownOverlay = page.locator(".dropdown-window-overlay");

    this.banner = page.locator(".p-navigation__banner");

    this.searchButton = page.locator(
      "nav.p-navigation__nav .js-search-button"
    );
    this.searchInput = page.locator('input[name="q"]');
    this.searchResetButton = page.locator("button.p-search-box__reset");
    this.searchOverlay = page.locator(".p-navigation__search-overlay");
    this.searchForm = page.locator("form.js-search-form");

    this.mobileMenuButton = page.locator(".js-menu-button");

    this.secondaryNav = page.locator("#secondary-navigation");
    this.secondaryNavTitle = page.locator(
      "#secondary-navigation .p-navigation__logo-title"
    );
    this.secondaryNavSelectedItem = page.locator(
      "#secondary-navigation .p-navigation__item.is-selected"
    );
    this.secondaryNavToggle = page.locator(
      "#secondary-navigation .p-navigation__toggle--open"
    );
  }

  sectionItem(id: string): Locator {
    return this.page.locator(`#${id}`);
  }

  sectionLink(id: string): Locator {
    return this.page.locator(`#${id} a.p-navigation__link`);
  }

  sectionContent(id: string): Locator {
    return this.page.locator(`#${id}-content`);
  }

  sectionSideNavLinks(id: string): Locator {
    return this.page.locator(`#${id}-content .p-side-navigation__link`);
  }

  sectionSideNavLinkByText(id: string, text: string): Locator {
    return this.page.locator(
      `#${id}-content .p-side-navigation__link:has-text("${text}")`
    );
  }

  async goto(path: string): Promise<void> {
    await this.page.goto(path);
    await acceptCookiePolicy(this.page);
  }

  async openDropdown(sectionId: string): Promise<void> {
    const link = this.sectionLink(sectionId);
    await link.hover();
    await this.sectionContent(sectionId)
      .locator("*")
      .first()
      .waitFor({ state: "attached", timeout: 10000 });
    await link.click();
    await expect(this.sectionItem(sectionId)).toHaveClass(/is-active/);
  }

  async openSearch(): Promise<void> {
    await this.searchButton.waitFor({ state: "visible" });
    await this.searchButton.click();
  }

  async closeSearchViaOverlay(): Promise<void> {
    await this.searchOverlay.waitFor({ state: "visible" });
    await this.searchOverlay.click();
  }

  async closeDropdownViaOverlay(): Promise<void> {
    const box = await this.dropdownWindow.boundingBox();
    if (!box) throw new Error("Dropdown window not visible");
    // Click below the dropdown window where the overlay is unobstructed
    await this.page.mouse.click(box.x + box.width / 2, box.y + box.height + 30);
  }

  async openMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
  }

  async closeMobileMenu(): Promise<void> {
    await this.mobileMenuButton.click();
  }
}
