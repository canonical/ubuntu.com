/**
 * Partners logo cloud
 *
 * @project        Ubuntu Core Front-End Framework
 * @author         Web Team at Canonical Ltd
 */

if (typeof partners !== "undefined") {
    throw TypeError('Namespace "partners" not available');
}

// Define this namespace
var partners = {}

/**
 * Loops through the partner clouds and loads the feeds for each.
 */
partners.loadPartnerClouds = function() {
    var logosCallbackClosure = function(count) {
        return function(partnerLogos) {
            return partners.renderLogos(
                partnerLogos,
                partnerLogoClouds[count]['elementId']
            );
        }
    }

    for (var cloudIter in partnerLogoClouds) {
        var params = partnerLogoClouds[cloudIter]['params'];
        var partnersAPI = 'http://partners.ubuntu.com/partners.json';
        var feedURI = partnersAPI + params + '&callback={callback}';

        partners.loadJSONP(
            feedURI,
            logosCallbackClosure(cloudIter)
        );
    }
    return true;
}

/**
 * Loads a given JSONP URI with a specified callback function,
 * Assigning a unique name to the callback function and writing it into
 * the URL in place of {callback}
 */
partners.loadJSONP = function(uri, callback) {
    // Name the callback function
    var functionName = 'callback' + Date.now();
    window[functionName] = callback;

    uri = uri.replace('{callback}', functionName);

    var script = document.createElement('script');
    script.src = uri;
    document.body.appendChild(script);
}

 /**
  * Render partner logos from a given object of partner logo data
  */
 partners.renderLogos = function (partnerLogos, selector) {
    if (! selector) {
        selector = '#dynamic-logos';
    }

    var containers = document.querySelectorAll(selector);

    if (! containers.length) {
        console.warn('No partner logo containers found for selector: ' + selector);
    }

    var numberPartners = partnerLogos.length;
    var numberToDisplay = numberPartners < 10 ? numberPartners : 10;

    for (var containerIndex = 0; containerIndex < containers.length; containerIndex++) {
        var container = containers[containerIndex];
        var htmlContents = ""

        for (var partnerIndex = 0; partnerIndex < numberToDisplay; partnerIndex++) {
            var partnerLogo = partnerLogos[partnerIndex];

            htmlContents += '<li class="inline-logos__item">';
            htmlContents += '  <img class="inline-logos__image" onload="this.style.opacity=\'1\';" '
            htmlContents += '       src="' + partnerLogo.logo + '" '
            htmlContents += '       alt="' + partnerLogo.name + '"'
            htmlContents += '  >'
            htmlContents += '</li>';
        }

        container.innerHTML = htmlContents;
    }
 };


// Check partnerLogoClouds is available and if not produce warning
if (typeof(partnerLogoClouds) === 'object') {
    partners.loadPartnerClouds();
} else {
    console.warn('Load partner logos: Expected array "partnerLogoClouds" not found. Stopping.');
}
