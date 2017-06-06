/**
 * Ubuntu Core Front-End Framework
 *
 * Core javascript file part of Ubuntu Core Front-End Framework
 *
 * @project        Ubuntu Core Front-End Framework
 * @author         Web Team at Canonical Ltd
 *
 */

if (!core) { var core = {}; }

core.svgFallback = function() {
	if (typeof Modernizr === "object") {
        var isIE = window.navigator.userAgent.indexOf("MSIE ");
        if (!Modernizr.svg || !Modernizr.backgroundsize || isIE !== -1) {
			var svgs = document.querySelectorAll("img[src$='.svg']")
            svgs.forEach(function(node) {
                var src = node.src;
                if (src.indexOf('assets.ubuntu.com/v1/') > -1) {
					// Support for the newer asset server
					node.src = src + '?fmt=png';
				} else {
					// Old asset manager and locally assets
					node.src = src.match(/.*\/(.+?)\./)[0] + 'png';
				}
			});
		}
	}
};

core.mobileNav = function () {
    var header = document.querySelector('header.banner');
    var navPrimary = document.querySelector('.nav-primary');
    var navSecondary = document.querySelector('.nav-secondary');
    var breadcrumbLinks = document.querySelector('.breadcrumb li a');

    if (navPrimary) {
        // Add the navigation toggle
        navToggle = document.createElement('a');
        navToggle.classList.add('nav-toggle');
        navToggle.id = 'menu';
        navToggle.innerHTML = 'menu';
        header.insertBefore(navToggle, navPrimary);

        // Adds a click listener to the navigation toggle
        navToggle.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle the navigations display state
            navToggle.classList.toggle('active');
            navPrimary.classList.toggle('active');
            document.querySelector('#nav ul').classList.toggle('active');
        });
    }

    if (breadcrumbLinks) {
        // Add chevron to first link
        var firstBreadcrumb = document.querySelector('.breadcrumb > li a');
        var breadcrumbChevron = document.createElement('a');
        breadcrumbChevron.classList.add('after');
        firstBreadcrumb.insertBefore(breadcrumbChevron, firstBreadcrumb.lastChild);
        // Add click listener to the chevron
        breadcrumbChevron.addEventListener('click', function(e) {
            e.preventDefault();
            // Toggle the secondary navigations display state
            navSecondary.classList.toggle('open');
        });
    }
};

core.svgFallback();
core.mobileNav();
