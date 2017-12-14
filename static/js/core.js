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

core.supportsSvg = function() {
    return document.implementation.hasFeature("http://www.w3.org/TR/SVG11/feature#Image", "1.1");
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

core.supportsSvg();
core.mobileNav();
