if (typeof forms !== 'undefined') {
  throw TypeError("Namespace 'forms' not available");
}

var forms = {};

forms.stateFormField = function() {
  var countrySelect = document.getElementById('Country');
  var formStateContainer = document.querySelector('.mktoPlaceholderState');

  // Only if things exist...
  if (countrySelect === null || formStateContainer === null) {
    return;
  }

  countrySelect.addEventListener('change', function(e) {
    var val = e.target.value;
    var optionGroup = document.querySelector('.mktoPlaceholderState__group--' + val);

    formStateContainer.setAttribute('data-country', val);

    if (optionGroup) {
      optionGroup.querySelectorAll('option')[0].selected = 'selected';
    }
  });
};

forms.stateFormField();
