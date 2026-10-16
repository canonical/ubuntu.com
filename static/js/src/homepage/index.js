import { initHomepage } from "./init";
import { startIconTooltip } from "./icon-tooltip";
import { startPerformanceRail } from "./performance-rail";
import { startCommunityTiles } from "./community-tiles";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [
  { selector: ".js-icon-tooltip", start: startIconTooltip },
  { selector: ".js-performance-rail", start: startPerformanceRail },
  { selector: ".js-community-tiles", start: startCommunityTiles },
];

initHomepage(modules);
