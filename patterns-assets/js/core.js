core = {};

$(document).ready(function() {
   core.readySearch('search');
});

// Clears and re-populates the search box
core.readySearch = function(className) {
	$('.' + className).bind({
		focus: function() {
			if ($(this).val() == 'Search') {
				$(this).val('');
			}
		},
		blur: function() {
			if ($(this).val() == '') {
				$(this).val('Search');
			}
		}
	});
};