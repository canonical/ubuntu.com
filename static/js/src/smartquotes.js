
function curlies(element) {
    function smarten(text) {
        return text
            /* opening singles */
            .replace(/(^|[-\u2014\s(\["])'/g, "$1\u2018")

            /* closing singles & apostrophes */
            .replace(/'/g, "\u2019")

            /* opening doubles */
            .replace(/(^|[-\u2014/\[(\u2018\s])"/g, "$1\u201c")

            /* closing doubles */
            .replace(/"/g, "\u201d")

            /* em-dashes */
            .replace(/--/g, "\u2014");
    };

    var children = element.children;

    if (children.length) {
        for(var i = 0, l = children.length; i < l; i++) {
            curlies(children[i]);
        }
    } else {
        element.innerHTML = smarten(element.innerHTML);
    }
};
