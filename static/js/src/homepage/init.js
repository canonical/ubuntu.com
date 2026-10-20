export function initHomepage(modules, scope = document) {
  modules.forEach(({ selector, start }) => {
    scope.querySelectorAll(selector).forEach((root) => {
      try {
        start(root);
      } catch (error) {
        console.error(`Homepage module "${selector}" failed to start`, error);
      }
    });
  });
}
