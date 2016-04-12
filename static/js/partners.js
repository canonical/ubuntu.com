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

    if (typeof(partnersApiParams) == 'undefined') {
        warn('Load partner logos: Expected variable "partnersApiParams" not found. Stopping.');
        dependencies = false;
    }

    if (typeof(partnersElementId) == 'undefined') {
        warn('Load partner logos: Expected variable "partnersElementId" not found. Stopping.');
        dependencies = false;
    } else if (! Y.one(partnersElementId)) {
        warn(
            "Load partner logos: Couldn't find the container element ("
            + partnersElementId +
            ")."
        );
        dependencies = false;
    }

    if (! dependencies) {
        warn('Load partner logos: Some dependencies are missing. Stopping.')
        return false;
    }

    if (typeof partnersFeedName === 'undefined') {
        partnersFeedName = 'partners';
    }

    var partnersAPI = "http://partners.ubuntu.com/" + partnersFeedName + ".json";
    var url = partnersAPI + partnersApiParams + "&callback={callback}";
    var callback = function(response) {
        return core.renderJSON(response, partnersElementId);
    }
    Y.jsonp(url, callback);
    return true;
});

