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

function wrapText(text, width) {
  text.each(function() {
    var text = d3.select(this);
    var words = text.text().split(/\s+/).reverse();
    var word;
    var line = [];
    var lineNumber = 0;
    var lineHeight = 1.1;
    var y = text.attr("y");
    var dy = parseFloat(text.attr("dy"));
    var tspan = text.text(null).append("tspan").attr("x", 0).attr("y", y).attr("dy", dy + "em");

    while (word = words.pop()) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text.append("tspan").attr("x", 0).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
      }
    }
  });
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

function createPieChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var parentWidth = document.querySelector(selector).parentNode.clientWidth;
  var sort = options.hasOwnProperty('sort') ? options.sort : undefined;
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : undefined;
  var colors = options.hasOwnProperty('colors') ? options.colors : ['#ed764d', '#ccc', '#925375'];
  var donutRadius = options.hasOwnProperty('donutRadius') ? options.donutRadius : 15;
  var size = options.hasOwnProperty('size') ? options.size : parentWidth;
  var ordinalColors = d3.scaleOrdinal(colors);

  // Create copy of dataset and manipulate according to options
  var data = dataset.slice();
  data = manipulateData(data, { sort: sort, truncPoint: truncPoint });

  // Orientate svg
  size = Math.min(size, parentWidth);
  var svg = d3.select(selector)
    .attr('height', size)
    .attr('width', size)
    .attr('class', 'p-pie-chart');
  var radius = size / 2;
  var g = svg.append("g")
    .attr('transform', 'translate(' + radius + ',' + radius + ')');

  // Generate pie values
  var pie = d3.pie()
    .value(function(d) { return d.value });

  // Generate the arcs
  var arc = d3.arc()
    .innerRadius(donutRadius)
    .outerRadius(radius);

  // Generate the groups
  var arcs = g.selectAll('.p-pie-chart__wedge')
    .data(pie(data))
    .enter()
    .append('g')
    .attr('class', 'p-pie-chart__wedge');

  // Draw arc paths
  arcs.append('path')
    .attr('fill', function(d, i) {
      return ordinalColors(i);
    })
    .attr('d', arc);

  // Add labels to centroid of segments
  arcs.append("text")
    .attr("transform", function(d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .attr("class", "p-pie-chart__text")
    .text(function(d) { if (d.data.show !== false) return d.data.label });
}

function clearCharts() {
  var charts = document.querySelectorAll('.p-bar-chart, .p-pie-chart, .p-fill-chart');
  charts.forEach(function(chart) {
    chart.innerHTML = '';
  });
}

function buildCharts() {
  showMaxDatum('#os-architecture', dummyData.osArchitecture.dataset);
  showMaxDatum('#display-server', dummyData.displayServer.dataset);
  showMaxDatum('#one-screen', dummyData.numberScreens.dataset);
  showMaxDatum('#one-gpu', dummyData.numberGPUs.dataset);

  createPieChart('#opt-in', dummyData.optIn.dataset, { size: 300 });
  createPieChart('#real-or-virtual', dummyData.realOrVirtual.dataset, { size: 300 });
  createPieChart('#firmware', dummyData.firmware.dataset, { size: 200 });
}

window.addEventListener('resize', debounce(function() {
  clearCharts();
  buildCharts();
}, 250));

buildCharts();
