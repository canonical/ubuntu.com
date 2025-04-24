rm -rf static/js/dist

mkdir -p static/js/dist

cp node_modules/@canonical/global-nav/dist/global-nav.js static/js/dist/

cp node_modules/@canonical/cookie-policy/build/js/cookie-policy.js static/js/dist/

cp node_modules/@canonical/latest-news/dist/latest-news.js static/js/dist

cp node_modules/intl-tel-input/build/js/utils.js static/js/dist

cp node_modules/flickity/dist/flickity.pkgd.min.js static/js/dist

# partytown copylib static/js/dist/~partytown


# yarn run build-global-nav 
# yarn run build-cookie-policy 
# yarn run build-latest-news 
# yarn run build-intl-tel-input-utils 
# yarn run build-flickity
