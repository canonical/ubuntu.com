import { initHomepage } from "./init";
import { startIconTooltip } from "./icon-tooltip";
import { startOpenSourceCarousel } from "./open-source-carousel";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [
  { selector: ".js-icon-tooltip", start: startIconTooltip },
  { selector: ".js-open-source-carousel", start: startOpenSourceCarousel },
];

initHomepage(modules);
