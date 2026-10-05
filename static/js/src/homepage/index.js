import { initHomepage } from "./init";
import { startIconTooltip } from "./icon-tooltip";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [{ selector: ".js-icon-tooltip", start: startIconTooltip }];

initHomepage(modules);
