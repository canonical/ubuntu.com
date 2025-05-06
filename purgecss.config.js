module.exports = {
  // Content paths to analyze for used CSS
  content: [
    // './templates/**/*.html',
    'templates/templates/**/*.html',
    'static/js/**/*.{js,jsx,ts,tsx}',
  ],
  
  // CSS files to process
  css: ['static/css/styles.css'],
  
  // Output directory for purged CSS files
  output: 'static/css/pages/',
  
  // Safelist selectors that should never be removed
  safelist: {
    standard: [
      // Add critical selectors that should never be purged
      /^p-/,
      /^u-/,
      /^is-/,
      /^has-/,
      /^vf-/,
      /^col-/,
      /^row/,
      'active',
      'open',
      'closed',
      /^flickity/,

      /^cookie-policy/,
      /^form/,
      /^js-/, // JavaScript-related classes
    ],
    deep: [
      // Patterns for deep selectors (with children)
      /p-navigation.*/,
      /p-footer.*/,
      /p-modal.*/,
      /form-.+/
    ],
    greedy: [
      /^iti/,
      /^mktoForm/, // Marketo forms
      /^cc-/, // Cookie consent related
      /^optanon/, // Cookie consent related
      /^has-/, // State-related classes
    ],
    keyframes: true,
    variables: true,
  },
  
  // PurgeCSS options
  defaultExtractor: content => content.match(/[\w-/:]+(?<!:)/g) || [],
  
  // Whitelist patterns (keep these selectors even if not found in content files)
  whitelist: ['html', 'body', 'a', 'p', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
};
