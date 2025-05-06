# CSS Optimization for ubuntu.com

This document explains how the CSS optimization system works for ubuntu.com to reduce the CSS file size for high-traffic routes.

## Overview

The ubuntu.com website uses a large CSS file (`styles.css`) that is compiled from SCSS files. This file is over 600KB in size, but most pages only use a small portion of these styles. To improve performance, we've implemented a system that creates route-specific optimized CSS files using PurgeCSS.

## How It Works

1. The main `styles.css` file is still compiled from all SCSS files
2. For high-traffic routes, we generate optimized CSS files using PurgeCSS
3. When a user visits a page, the Flask application checks if an optimized CSS file exists for that route
4. If an optimized file exists, it's served instead of the full CSS file
5. If no optimized file exists, the full CSS file is served as a fallback

## Directory Structure

Optimized CSS files are stored in the following structure:

```
/static/css/pages/
  ├── index/
  │   └── index.purged.css
  ├── download/
  │   └── download.purged.css
  ├── desktop/
  │   └── desktop.purged.css
  └── ...
```

## Adding New Routes

To add a new route for optimization:

1. Edit the `scripts/generate-route-css.js` file
2. Add a new entry to the `routes` array with the route name and templates to analyze

Example:
```javascript
{
  name: 'your-route',
  templates: ['./templates/your-route/**/*.html', './templates/shared/**/*.html', './templates/global.html']
}
```

## Configuration

The PurgeCSS configuration is defined in `purgecss.config.js`. This includes:

- Content paths to analyze for used CSS
- CSS files to process
- Output directory for purged CSS files
- Safelist selectors that should never be removed

## Implementation Details

- `webapp/context_css.py`: Contains the `get_optimized_css()` function that determines if an optimized CSS file exists for the current route
- `webapp/app_css.py`: Initializes the CSS optimization system and adds the `get_optimized_css()` function to the template context

## Best Practices

1. Test pages with optimized CSS to ensure all necessary styles are included
2. Consider adding critical selectors to the safelist in `purgecss.config.js` if you notice missing styles
3. Monitor the size reduction of optimized CSS files to ensure they're providing significant benefits
