if (typeof forms !== 'undefined') {
  throw TypeError("Namespace 'forms' not available");
}

var forms = {}

/**
 * Add sliders (input type=range) next to all input type=number elements
 * that match the provided selector (default: '[type=number]')
 * Optionally apply a class to each created slider.
 */
forms.addSliders = function (numberElementsSelector, slidersClass) {
  numberElementsSelector = numberElementsSelector || '[type=number]';
  slidersClass = slidersClass || '';

  var slider = document.createElement('input');
  slider.className = slidersClass;
  slider.setAttribute('type', 'range');

  if (slider.type == 'range') {  // Check 'range' is supported
    var updateValueClosure = function (sisterNode) {
      return function(changeEvent) {
        targetNode = changeEvent.target;
        sisterNode.value = targetNode.value;
      }
    }

    var appendSlider = function (numberElement) {
      var thisSlider = slider.cloneNode();

      // Set initial values
      var initialValue = parseInt(numberElement.value || '0');
      var min = parseInt(numberElement.min || '0');
      var max = parseInt(numberElement.max || '100');
      thisSlider.value = initialValue;
      thisSlider.min = min;
      thisSlider.max = max;
      numberElement.value = initialValue;
      numberElement.min = min;
      numberElement.max = max;

      // Add change listeners
      var updateSlider = updateValueClosure(thisSlider);
      var updateNumber = updateValueClosure(numberElement);
      numberElement.addEventListener('input', updateSlider);
      thisSlider.addEventListener('input', updateNumber);

      // Create slider
      numberElement.parentNode.insertBefore(
        thisSlider,
        numberElement.nextSibling
      )
    }

    document.querySelectorAll(numberElementsSelector).forEach(appendSlider);
  }
}
