function debounce(func, wait, immediate) {
	var timeout;
	return function() {
		var context = this, args = arguments;
		clearTimeout(timeout);
		timeout = setTimeout(function() {
			timeout = null;
			if (!immediate) func.apply(context, args);
		}, wait);
		if (immediate && !timeout) func.apply(context, args);
	};
}

function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.floor(value * multiplier) / multiplier;
}

function calcPercentage(dataset, datum) {
  var sum = d3.sum(dataset, function(d) { return d.value });
  var percentage = datum * 100 / sum;

  return percentage;
}

function manipulateData(data, options) {
  // Set option defaults
  options = options || {};
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : data.length;
  var sort = options.hasOwnProperty('sort') ? options.sort : undefined;
  var sortedData = data.slice();

  switch (sort) {
    case 'descending':
      sortedData.sort(function(a, b) { return d3.descending(a.value, b.value) });
      return sortedData.slice(0, truncPoint);

    case 'ascending':
      sortedData.sort(function(a, b) { return d3.ascending(a.value, b.value) });
      return sortedData.slice(sortedData.length - truncPoint, sortedData.length);

    default: 
      return sortedData.slice(0, truncPoint);
  }
}

function showMaxDatum(target, dataset) {
  var maxDatum = manipulateData(dataset, 'descending', 1)[0];
  var percentage = calcPercentage(dataset, maxDatum.value)
  var roundedPercentage = round(percentage, 1);

  document.querySelector(target).innerHTML = (
    '<h3 style="margin:0">' + roundedPercentage + '%</h3>' +
    '<h4>' + maxDatum.label + '</h4>'
  );
}

showMaxDatum('#os-architecture', dummyData.osArchitecture.dataset);
showMaxDatum('#display-server', dummyData.displayServer.dataset);
showMaxDatum('#one-screen', dummyData.numberScreens.dataset);
showMaxDatum('#one-gpu', dummyData.numberGPUs.dataset);
