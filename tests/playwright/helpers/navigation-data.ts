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

const yamlPath = path.resolve(__dirname, "../../../navigation.yaml");
const navData = yaml.load(fs.readFileSync(yamlPath, "utf8")) as NavigationData;

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
