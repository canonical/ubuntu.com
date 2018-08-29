function round(value, precision) {
  var multiplier = Math.pow(10, precision || 0);
  return Math.floor(value * multiplier) / multiplier;
}

function calcPercentage(dataset, datum) {
  var sum = d3.sum(dataset, function(d) { return d.value });
  var percentage = datum * 100 / sum;

  return percentage;
}

function manipulateData(dataset, sortType, truncPoint) {
  // Set parameter defaults
  var sortType = typeof sortType !== 'undefined' ? sortType : 'descending';
  var truncPoint = typeof truncPoint !== 'undefined' ? truncPoint : dataset.length;

  if (sortType === 'descending') {
    var sortedData = dataset.sort(function(a, b) {
      return d3.descending(a.value, b.value);
    });

    return sortedData.slice(0, truncPoint);
  } else if (sortType === 'ascending') {
    var sortedData = dataset.sort(function(a, b) {
      return d3.ascending(a.value, b.value);
    });

    return sortedData.slice(sortedData.length - truncPoint, sortedData.length);
  }

  return dataset.slice(0, truncPoint);
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