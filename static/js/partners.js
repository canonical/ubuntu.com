/**
 * Generate a warnin only if warnings are available.
 */
function warn(message) {
    if (typeof(console) == 'object' && typeof(console.warn) == 'function') {
        console.warn(message);
    }
}

/**
 * Call the partners API and load
 */
YUI().use('jsonp', 'node', function(Y) {
    dependencies = true;

    if (typeof(partnerLogoClouds) != 'object') {
        warn('Load partner logos: Expected array "partnerLogoClouds" not found. Stopping.');
        dependencies = false;
    }

    for (var cloudIter in partnerLogoClouds) {
      var cloud = partnerLogoClouds[cloudIter];
      var partnersAPI = "http://partners.ubuntu.com/partners.json";
      var url = partnersAPI + cloud['params'] + "&callback={callback}";
      Y.jsonp(
        url,
        (function(elementId) {
          return function(response) {
            console.log(elementId)
            return core.renderJSON(response, elementId);
          }
        })(cloud['elementId'])
      );
    }
    return true;
});
