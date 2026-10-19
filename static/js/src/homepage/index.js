import { initHomepage } from "./init";
import { startHero } from "./hero";
import { startIconTooltip } from "./icon-tooltip";
import { startPerformanceRail } from "./performance-rail";
import { startCommunityTiles } from "./community-tiles";
import { startOpenSourceCarousel } from "./open-source-carousel";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [
  { selector: ".js-hero", start: startHero },
  { selector: ".js-icon-tooltip", start: startIconTooltip },
  { selector: ".js-performance-rail", start: startPerformanceRail },
  { selector: ".js-community-tiles", start: startCommunityTiles },
  { selector: ".js-open-source-carousel", start: startOpenSourceCarousel },
];

initHomepage(modules);
