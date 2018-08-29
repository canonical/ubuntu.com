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
