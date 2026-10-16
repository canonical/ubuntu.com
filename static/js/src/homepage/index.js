import { initHomepage } from "./init";
import { startHero } from "./hero";
import { startIconTooltip } from "./icon-tooltip";
import { startPerformanceRail } from "./performance-rail";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [
  { selector: ".js-hero", start: startHero },
  { selector: ".js-icon-tooltip", start: startIconTooltip },
  { selector: ".js-performance-rail", start: startPerformanceRail },
];

initHomepage(modules);
