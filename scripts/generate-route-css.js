#!/usr/bin/env node

/**
 * Script to generate route-specific CSS files using PurgeCSS
 * This script creates optimized CSS files for high-traffic routes
 */

const { PurgeCSS } = require('purgecss');
const fs = require('fs');
const path = require('path');
const baseConfig = require('../purgecss.config.js');

// Define the top routes to optimize
const routes = [
  {
    name: 'index',
    templates: ['templates/index.html', 'templates/base_index.html']
  },
  {
    name: 'download',
    templates: ['templates/base.html', 'templates/download/**/*.html', 'templates/shared/**/*.html']
  },
  // {
  //   name: 'desktop',
  //   templates: ['./templates/desktop/**/*.html', './templates/shared/**/*.html']
  // },
  // {
  //   name: 'server',
  //   templates: ['./templates/server/**/*.html', './templates/shared/**/*.html']
  // },
  // {
  //   name: 'cloud',
  //   templates: ['./templates/cloud/**/*.html', './templates/shared/**/*.html']
  // }
];

// Ensure output directories exist
const ensureDirectoryExists = (dirPath) => {
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }
};

// Process each route
async function processRoutes() {
  console.log('Generating route-specific CSS files...');
  
  for (const route of routes) {
    console.log(`Processing route: ${route.name}`);
    
    // Create route-specific output directory
    const outputDir = path.join(baseConfig.output, route.name);
    console.log("🚀 ~ processRoutes ~ outputDir:", outputDir)
    ensureDirectoryExists(outputDir);
    
    // Configure PurgeCSS for this route
    const routeConfig = {
      ...baseConfig,
      // css: ['static/css/styles.css'],
      content: [...baseConfig.content, ...route.templates],
      output: `${outputDir}/${route.name}.purged.css`
    };
    
    try {
      // Run PurgeCSS
      const result = await new PurgeCSS().purge(routeConfig);
      // console.log("🚀 ~ processRoutes ~ result:", result)
      
      // Write the purged CSS to file
      for (const purgedCss of result) {
        const outputPath = path.join(outputDir, `${route.name}.purged.css`);
        fs.writeFileSync(outputPath, purgedCss.css);
        
        // Calculate size reduction
        const originalSize = fs.statSync(baseConfig.css[0]).size;
        const purgedSize = fs.statSync(outputPath).size;
        const reduction = ((originalSize - purgedSize) / originalSize * 100).toFixed(2);
        
        console.log(`✅ ${route.name}: ${(purgedSize / 1024).toFixed(2)}KB (${reduction}% reduction)`);
      }
    } catch (error) {
      console.error(`❌ Error processing ${route.name}:`, error);
    }
  }
}

// Run the script
processRoutes().then(() => {
  console.log('CSS optimization complete!');
}).catch(err => {
  console.error('Error generating CSS files:', err);
  process.exit(1);
});
