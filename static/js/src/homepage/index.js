import { initHomepage } from "./init";
import { startCommunityTiles } from "./community-tiles";

// Each section adds { selector: ".js-…", start(root) } here.
const modules = [
  { selector: ".js-community-tiles", start: startCommunityTiles },
];

initHomepage(modules);
