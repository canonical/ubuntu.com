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


// Marketo form state/province select/optgroup js
forms.stateFormField = function() {
	var formStateLabel = document.querySelector('[for="State"]');
  var formStateSelect = document.getElementById('State');
  var formStateContainer = document.querySelector('.mktoPlaceholderState');
  var formUSAOpt = document.querySelector('[value="SelectState"]');
  var formCanadaOpt = document.querySelector('[value="SelectProvince"]');

	// starting state, no field
	state('default');

	function state(stateChange) {
    switch(stateChange) {
      case 'US':
        formStateContainer.style.display = 'inline';
        formStateLabel.innerHTML="State:";
        formUSAOpt.style.display = 'inline';
        formStateSelect.selectedIndex = "-1";
        formCanadaOpt.style.display = 'none';
        break;
      case 'CA':
        formStateContainer.style.display = 'inline';
        formStateLabel.innerHTML="Province:";
        formCanadaOpt.style.display = 'inline';
        formStateSelect.selectedIndex = "-1";
        formUSAOpt.style.display = 'none';
        break;
      default:
        // default is to hide the field
        formStateContainer.style.display = 'none';
        formUSAOpt.style.display = 'none';
        formCanadaOpt.style.display = 'none';
        break;
     };
	};

	var countrySelect = document.getElementById('Country');
	  countrySelect.addEventListener('change', function(e) {
  	  var val=e.target.value;
      state(val);
    });
};

forms.stateFormField();
// end Marketo form state/province select/optgroup js
