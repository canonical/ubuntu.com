/* Polyfill functions
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
