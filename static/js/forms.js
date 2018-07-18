if (typeof forms !== 'undefined') {
  throw TypeError("Namespace 'forms' not available");
}

var forms = {}

// Marketo form state/province select/optgroup js
forms.stateFormField = function() {
	var formStateLabel = document.querySelector('[for="State"]');
  var formStateSelect = document.getElementById('State');
  var formStateContainer = document.querySelector('.mktoPlaceholderState');
  var formUSAOpt = document.querySelector('[value="SelectState"]');
  var formCanadaOpt = document.querySelector('[value="SelectProvince"]');

  // Only if things exist...
  if (formStateContainer === null) {
    return;
  }

	// starting state, no field
	state('default');

	function state(stateChange) {
    switch(stateChange) {
      case 'US':
        formStateContainer.style.display = 'inline';
        formStateLabel.innerHTML = 'State:';
        formUSAOpt.style.display = 'inline';
        formStateSelect.selectedIndex = '-1';
        formCanadaOpt.style.display = 'none';
        break;
      case 'CA':
        formStateContainer.style.display = 'inline';
        formStateLabel.innerHTML = 'Province:';
        formCanadaOpt.style.display = 'inline';
        formStateSelect.selectedIndex = '-1';
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
  	  var val = e.target.value;
      state(val);
    });
};

forms.stateFormField();
// end Marketo form state/province select/optgroup js
