import fs from "fs";
import path from "path";
import yaml from "js-yaml";

interface NavLink {
  title: string;
  description?: string;
  url: string;
  secondary_cta_title?: string;
  secondary_cta_url?: string;
}

interface LinkGroup {
  title?: string;
  links: NavLink[];
}

interface SectionFooter {
  copy?: string;
  cta_title: string;
  cta_url: string;
}

interface SideNavSection {
  title: string;
  primary_links: LinkGroup[];
  secondary_links?: LinkGroup[];
  section_footer?: SectionFooter;
}

interface FlatSection {
  primary_links?: LinkGroup[];
  secondary_links?: LinkGroup[];
  highlighted_secondary_links?: LinkGroup[];
  side_nav_sections?: SideNavSection[];
}

type NavigationData = Record<string, FlatSection>;

// --- Secondary navigation types ---

interface SecondaryNavChild {
  title: string;
  path: string;
  login_required?: boolean;
}

interface SecondaryNavSection {
  title: string;
  path: string;
  children: SecondaryNavChild[];
}

type SecondaryNavigationData = Record<string, SecondaryNavSection>;

// --- Load YAML data ---

const yamlPath = path.resolve(__dirname, "../../../navigation.yaml");
const navData = yaml.load(fs.readFileSync(yamlPath, "utf8")) as NavigationData;

const secondaryYamlPath = path.resolve(
  __dirname,
  "../../../secondary-navigation.yaml"
);
const secondaryNavData = yaml.load(
  fs.readFileSync(secondaryYamlPath, "utf8")
) as SecondaryNavigationData;

/** Convert a test section ID (hyphens) to a YAML key (underscores). */
function toYamlKey(sectionId: string): string {
  return sectionId.replace(/-/g, "_");
}

function getSection(sectionId: string): FlatSection {
  const key = toYamlKey(sectionId);
  const section = navData[key];
  if (!section) {
    throw new Error(`Section "${key}" not found in navigation.yaml`);
  }
  return section;
}

/** Side nav tab titles for sections that use side_nav_sections. */
export function getSideNavTitles(sectionId: string): string[] {
  const section = getSection(sectionId);
  if (!section.side_nav_sections) {
    throw new Error(`Section "${sectionId}" has no side_nav_sections`);
  }
  return section.side_nav_sections.map((s) => s.title);
}

/** Primary links for a specific tab within a side-nav section. */
export function getPrimaryLinks(
  sectionId: string,
  tabTitle: string
): NavLink[] {
  const section = getSection(sectionId);
  if (!section.side_nav_sections) {
    throw new Error(`Section "${sectionId}" has no side_nav_sections`);
  }
  const tab = section.side_nav_sections.find((s) => s.title === tabTitle);
  if (!tab) {
    throw new Error(`Tab "${tabTitle}" not found in section "${sectionId}"`);
  }
  return tab.primary_links.flatMap((g) => g.links);
}

/** For flat-layout sections, returns groups with their titles and links. */
export function getFlatPrimaryLinks(
  sectionId: string
): { groupTitle: string | undefined; links: NavLink[] }[] {
  const section = getSection(sectionId);
  if (!section.primary_links) {
    throw new Error(`Section "${sectionId}" has no primary_links`);
  }
  return section.primary_links.map((g) => ({
    groupTitle: g.title,
    links: g.links,
  }));
}

/** Highlighted secondary links for flat-layout sections (e.g. "By industry"). */
export function getFlatSecondaryLinks(
  sectionId: string
): { groupTitle: string | undefined; links: NavLink[] }[] {
  const section = getSection(sectionId);
  if (!section.highlighted_secondary_links) {
    throw new Error(
      `Section "${sectionId}" has no highlighted_secondary_links`
    );
  }
  return section.highlighted_secondary_links.map((g) => ({
    groupTitle: g.title,
    links: g.links,
  }));
}

/** Section footer (CTA) for a specific tab within a side-nav section. */
export function getSectionFooter(
  sectionId: string,
  tabTitle: string
): SectionFooter {
  const section = getSection(sectionId);
  if (!section.side_nav_sections) {
    throw new Error(`Section "${sectionId}" has no side_nav_sections`);
  }
  const tab = section.side_nav_sections.find((s) => s.title === tabTitle);
  if (!tab || !tab.section_footer) {
    throw new Error(
      `No section_footer for tab "${tabTitle}" in section "${sectionId}"`
    );
  }
  return tab.section_footer;
}

// --- Secondary navigation helpers ---

function isLocalPath(p: string): boolean {
  return p.startsWith("/");
}

/** Sections that don't render secondary nav in the test environment. */
const EXCLUDED_SECTIONS = new Set([
  // "blog", // External BlogAPI content
  // "tutorials", // External Discourse content
  // "community", // External Discourse endpoints
  "account", // Requires login — redirects to /login
  "Distributor", // Requires login — redirects to /login
  // "documentation", // Internal docs pages (/0_docs) not publicly routed
  "credentials", // redirects to https://canonical.com/academy
  // "legal", // Legal pages don't render secondary nav
]);

/** All secondary nav sections with local paths (excludes external URLs). */
export function getSecondaryNavSections(): {
  key: string;
  section: SecondaryNavSection;
}[] {
  return Object.entries(secondaryNavData)
    .filter(
      ([key, section]) =>
        !EXCLUDED_SECTIONS.has(key) && isLocalPath(String(section.path))
    )
    .map(([key, section]) => ({
      key,
      section: {
        ...section,
        title: String(section.title),
        path: String(section.path),
      },
    }));
}

/** A single secondary nav section by YAML key. */
export function getSecondaryNavSection(key: string): SecondaryNavSection {
  const section = secondaryNavData[key];
  if (!section) {
    throw new Error(
      `Section "${key}" not found in secondary-navigation.yaml`
    );
  }
  return section;
}

/** Child titles for a section, excluding Overview, login_required, and external items. */
export function getSecondaryNavChildTitles(key: string): string[] {
  const section = getSecondaryNavSection(key);
  return section.children
    .filter((c) => c.title !== "Overview" && !c.login_required && isLocalPath(c.path))
    .map((c) => c.title);
}
