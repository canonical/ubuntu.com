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

function createProgressChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var parentWidth = document.querySelector(selector).parentNode.clientWidth;
  var color = options.hasOwnProperty('color') ? options.color : '#ed764d';
  var size = options.hasOwnProperty('size') ? options.size : 300;

  // Create copy of dataset
  var data = dataset.slice();

  // Orientate svg
  size = Math.min(size, parentWidth);
  var height = size;
  var width = size;
  var svg = d3.select(selector)
    .attr('height', height)
    .attr('width', width)
    .attr('class', 'p-progress-chart');
  var g = svg.append("g");

  // Set axis domains and range
  var x = d3.scaleBand()
    .rangeRound([0, width]);

  var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain([0, 100]);

  // Generate bar
  g.selectAll(".p-progress-chart__bar")
    .data(dataset)
    .enter()
    .append("rect")
    .attr("class", "p-progress-chart__bar")
    .attr('fill', color)
    .attr("y", function(d) { return y(calcPercentage(data, d.value)) })
    .attr("width", x.bandwidth())
    .attr("height", function(d) {
      if (d.show) return height - y(calcPercentage(data, d.value))
    });

  // Append percentage over top of graph
  svg
    .append("text")
    .attr("class", "p-progress-chart__text")
    .attr("transform", function() {
      return "translate(" + height / 2 + "," + ((width + 20) / 2) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function() {
      var value = round(d3.max(data, function(d) {
        if (d.show) return calcPercentage(data, d.value)
      }), 1);

      return value + '%';
    });
}

function clearCharts() {
  var charts = document.querySelectorAll('.p-bar-chart, .p-pie-chart, .p-progress-chart');
  charts.forEach(function(chart) {
    chart.innerHTML = '';
  });
}

function buildCharts() {
  showMaxDatum('#os-architecture', dummyData.osArchitecture.dataset);
  showMaxDatum('#display-server', dummyData.displayServer.dataset);
  showMaxDatum('#one-screen', dummyData.numberScreens.dataset);
  showMaxDatum('#one-gpu', dummyData.numberGPUs.dataset);

  createProgressChart('#default-settings-hw', dummyData.defaultSettings.datasets.hardware);
  createProgressChart('#restrict-add-on-hw', dummyData.restrictAddOn.datasets.hardware);
  createProgressChart('#auto-login-hw', dummyData.autoLogin.datasets.hardware);
  createProgressChart('#minimal-install-hw', dummyData.minimalInstall.datasets.hardware);
  createProgressChart('#update-at-install-hw', dummyData.updateAtInstall.datasets.hardware);
  createProgressChart('#default-settings-vm', dummyData.defaultSettings.datasets.virtual, { color: '#925375' });
  createProgressChart('#restrict-add-on-vm', dummyData.restrictAddOn.datasets.virtual, { color: '#925375' });
  createProgressChart('#auto-login-vm', dummyData.autoLogin.datasets.virtual, { color: '#925375' });
  createProgressChart('#minimal-install-vm', dummyData.minimalInstall.datasets.virtual, { color: '#925375' });
  createProgressChart('#update-at-install-vm', dummyData.updateAtInstall.datasets.virtual, { color: '#925375' });
}

window.addEventListener('resize', debounce(function() {
  clearCharts();
  buildCharts();
}, 250));

buildCharts();
