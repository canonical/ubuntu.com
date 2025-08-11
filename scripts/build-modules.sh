
#!/bin/bash

# Build cookie policy
cp node_modules/@canonical/cookie-policy/build/js/cookie-policy.js static/js/dist/

# Build flickity
cp node_modules/flickity/dist/flickity.pkgd.min.js static/js/dist/

# Build global nav
cp node_modules/@canonical/global-nav/dist/global-nav.js static/js/dist/

# Build latest news
cp node_modules/@canonical/latest-news/dist/latest-news.js static/js/dist/

# Build intl tel input utils
cp node_modules/intl-tel-input/build/js/utils.js static/js/dist/

# Build prism components
mkdir -p static/js/dist/prism-components && cp -r node_modules/prismjs/components/*.min.js static/js/dist/prism-components/

# Build leaflet
cp node_modules/leaflet/dist/leaflet.js static/js/dist/
