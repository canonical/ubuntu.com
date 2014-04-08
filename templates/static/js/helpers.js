/* Pollyfill functions
 * =================== */

/**
 * Array.prototype.forEach polyfill
 * from https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Array/forEach
 */
if (!Array.prototype.forEach) {
    Array.prototype.forEach = function(fun) {
        if (
            this === void 0
            || this === null
            || typeof fun !== "function"
        ) { throw new TypeError(); }

        var t = Object(this);
        var len = t.length >>> 0;

        var thisArg = arguments.length >= 2 ? arguments[1] : void 0;
        for (var i = 0; i < len; i++) {
            if (i in t) {
                fun.call(thisArg, t[i], i, t);
            }
        }
    };
}

/* General helpers
 * =============== */

/**
 * Generate a random ID including the datestamp for uniqueness
 */
function generateRandomId() {
    // really crude unique ID
    var date = new Date();
    var random = Math.floor(Math.random()*1000);
    return date.valueOf()+''+random;
}

/* YUI3 helpers
 * ============ */

/**
 * Test whether this browser can handle linear gradients
 * return Boolean
 */
function canSetLinearGradient() {
    var canSetLinearGradient = true;

    try {
        // Try to set the gradient on a dummy element
        YUI().use('node', function(Y) {
            Y.Node.create('<div/>').setStyle('background', 'linear-gradient(red,blue)');
        });
    } catch (exception) {
        // If we got "invalid argument" then we can't set linear-gradient
        if (exception.message == 'Invalid argument.') {
            canSetLinearGradient = false;
        } else {
            throw exception;
        }
    }

    return canSetLinearGradient;
}

/**
 * Given a YUI3 NodeList
 * Hide all but one of them
 * randomly choosing the one to show
 */
function hideAllButOne(elements) {
    // Hide all
    elements.setStyle('display', 'none');

    // Randomly select one to be visible
    var visibleItemIndex = Math.floor(Math.random() * elements.size());
    elements.item(visibleItemIndex).setStyle('display', 'block'); // Show it
}