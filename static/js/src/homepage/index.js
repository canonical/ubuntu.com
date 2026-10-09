import { initHomepage } from "./init";
import { startIconTooltip } from "./icon-tooltip";
import { startPerformanceRail } from "./performance-rail";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [
  { selector: ".js-icon-tooltip", start: startIconTooltip },
  { selector: ".js-performance-rail", start: startPerformanceRail },
];

initHomepage(modules);
