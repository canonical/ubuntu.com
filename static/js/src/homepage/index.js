import { initHomepage } from "./init";
import { startPerformanceRail } from "./performance-rail";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [
  { selector: ".js-performance-rail", start: startPerformanceRail },
];

initHomepage(modules);
