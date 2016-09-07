
/**
 * Partners logo cloud
 *
 * @project        Ubuntu Core Front-End Framework
 * @author         Web Team at Canonical Ltd
 * @copyright      Canonical Ltd
 */

if (!core) { var core = {}; }

// Loops through the partner clouds and loads the feeds for each.
core.loadPartnerClouds = function() {
    for (var cloudIter in partnerLogoClouds) {
        var cloud = partnerLogoClouds[cloudIter];
        var partnersAPI = 'http://partners.ubuntu.com/partners.json';
        var feedURI = partnersAPI + cloud['params'] + '&callback={callback}';
        core.loadJSON(feedURI, cloud['elementId', function(response) {
            var response = JSON.parse(response);
            return core.renderJSON(response, elementId);
        });
    }
    return true;
}

// Loads a given URI and returns to response to the callback function.
core.loadJSON = function(uri, elementId, callback) {
    var xobj = new XMLHttpRequest();
    xobj.overrideMimeType("application/json");
    xobj.open('GET', uri, true);
    xobj.onreadystatechange = function () {
          if (xobj.readyState == 4 && xobj.status == "200") {
            callback(xobj.responseText, elementId);
          }
    };
    xobj.send(null);
 }

 // Checks partnerLogoClouds is available and if not warns.
 if (typeof(partnerLogoClouds) === 'object') {
     core.loadPartnerClouds();
 } else {
     console.warn('Load partner logos: Expected array "partnerLogoClouds" not found. Stopping.');
 }
