const purgeCSSPlugin = require("@fullhuman/postcss-purgecss");

/** @type {import('postcss-load-config').Config} */
let config = {
  plugins: [
    require("autoprefixer"),
    purgeCSSPlugin({
      content: [
        "templates/**/*.html",
        "static/**/*.js",
        "static/*.js",
        "static/*.jsx",
        "static/*.md",
        "static/*.tsx",
        "static/*.xml",
        "templates/templates/**/*.html",
        "static/**/*.{js,jsx,ts,tsx,md,xml}",
        "templates/**/*.jinja",
        "static/**/*.tsx",
        "webapp/**/*.py",
        "templates/**/*.md",
        "templates/**/*.py",
        "templates/**/*.xml",
        "node_modules/@canonical/cookie-policy/build/js/cookie-policy.js",
        "node_modules/flickity/dist/flickity.pkgd.min.js",
        "node_modules/@canonical/global-nav/dist/global-nav.js",
        "node_modules/@canonical/latest-news/dist/latest-news.js",
        "node_modules/intl-tel-input/build/js/utils.js",
        "node_modules/vanilla-framework/templates/**/*.jinja",
      ],
      defaultExtractor: (content) => content.match(/[\w-/:]+(?<!:)/g) || [],
      extractors: [
        {
          extractor: (content) => {
            const matches = content.match(/class=["']([^"']+)["']|class=([^\s>]+)|class:\s*{([^}]+)}/g) || [];
            return matches.map(match => {
              return match.replace(/class=["']|class=|class:\s*{|["'}]/g, '').split(/\s+/);
            }).flat();
          },
          extensions: ['html']
        }
      ],
      safelist: {
        standard: [
          /^cookie-policy/,
          /^form/,
          /^p-/, // Preserve form related classes
          /^u-/, // Utility classes
          /^is-/,
          /^js-/, // JavaScript-related classes
        ],
        greedy: [
          /^iti/,
          /^mktoForm/, // Marketo forms
          /^cc-/, // Cookie consent related
          /^optanon/, // Cookie consent related
          /^has-/, // State-related classes
        ],
        deep: [/form-.+/],
        keyframes: true,
        variables: true,
      },
    }),
  ],
};

module.exports = config;
