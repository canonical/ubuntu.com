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

function createBarChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var sort = options.hasOwnProperty('sort') ? options.sort : undefined;
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : undefined;
  var numTicks = options.hasOwnProperty('ticks') ? options.ticks : 5;
  var margin = options.hasOwnProperty('margin') ? options.margin : { top: 20, right: 5, bottom: 50, left: 40 };
  var colors = options.hasOwnProperty('colors') ? options.colors : ['#ed764d', '#ccc', '#925375'];
  var ordinalColors = d3.scaleOrdinal(colors);

  // Create copy of dataset and manipulate according to options
  var data = dataset.slice();
  data = manipulateData(data, { sort: sort, truncPoint: truncPoint });

  // Orientate svg and give it class name
  var svg = d3.select(selector).attr("class", "p-bar-chart");
  var width = document.querySelector(selector).getBoundingClientRect().width - margin.right - margin.left;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set axis domains and range
  var x = d3.scaleBand()
    .rangeRound([0, width])
    .padding(0.1)
    .domain(data.map(function(d) { return d.label }));

  var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain([0, Math.ceil(d3.max(data, function(d) { return calcPercentage(data, d.value) }))]);

  // Generate axes
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll(".tick text")
    .attr("text-anchor", "middle")
    .call(wrapText, x.bandwidth());

  g.append("g")
    .call(d3.axisLeft(y)
      .tickFormat(function(d) { return d + '%' })
      .ticks(numTicks));

  // Generate bars
  g.selectAll(".p-bar-chart__bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "p-bar-chart__bar")
    .attr('fill', function(d, i) {
      return ordinalColors(i);
    })
    .attr("x", function(d) { return x(d.label) })
    .attr("y", function(d) { return y(calcPercentage(data, d.value)) })
    .attr("width", x.bandwidth())
    .attr("height", function(d) { return height - y(calcPercentage(data, d.value)) });
}

function createHorizontalBarChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var sort = options.hasOwnProperty('sort') ? options.sort : undefined;
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : undefined;
  var numTicks = options.hasOwnProperty('ticks') ? options.ticks : 5;
  var margin = options.hasOwnProperty('margin') ? options.margin : { top: 20, right: 20, bottom: 20, left: 60 };
  var colors = options.hasOwnProperty('colors') ? options.colors : ['#ed764d', '#ccc', '#925375'];
  var ordinalColors = d3.scaleOrdinal(colors);

  // Create copy of dataset and manipulate according to options
  var data = dataset.slice().reverse();
  data = manipulateData(data, { sort: sort, truncPoint: truncPoint });

  // Orientate svg and give it class name
  var svg = d3.select(selector).attr("class", "p-bar-chart");
  var width = document.querySelector(selector).getBoundingClientRect().width - margin.right - margin.left;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg.append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set axis domains and range
  var y = d3.scaleBand()
    .range([height, 0])
    .padding(0.1)
    .domain(data.map(function(d) { return d.label }));

  var x = d3.scaleLinear()
    .range([0, width])
    .domain([0, Math.ceil(d3.max(data, function(d) { return calcPercentage(data, d.value) }))]);

  // Generate axes
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .tickFormat(function(d) { return d + '%' })
      .ticks(numTicks));

  g.append("g")
    .call(d3.axisLeft(y))
    .selectAll(".tick text")
    .attr("text-anchor", "left")
    .call(wrapText, margin.left)
    .attr("transform", function() {
      var marginRight = 10;
      var fontSize = window.getComputedStyle(this).fontSize;
      var textHeight = this.getBBox().height - 1;
      var yPos = (-textHeight / 2) + (parseInt(fontSize, 10) / 2);

      return "translate(-" + marginRight + "," + yPos + ")";
    });

  // Generate bars
  g.selectAll(".p-bar-chart__bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "p-bar-chart__bar")
    .attr('fill', function(d, i) {
      return ordinalColors(i);
    })
    .attr("x", 1)
    .attr("y", function(d) { return y(d.label) })
    .attr("height", y.bandwidth())
    .attr("width", function(d) { return x(calcPercentage(data, d.value)) });
}

function createOrderedList(target, dataset, options) {
  // Set option defaults
  options = options || {};
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : undefined;
  var data = dataset.slice();

  var sortedList = data
    .sort(function(a, b) { return d3.descending(a.value, b.value) });
  var count = Math.min(dataset.length, truncPoint);
  var html = '';

  for (var i = 0; i < count; i++) {
    html += '<li>' + sortedList[i].label + '</li>';
  }

  document.querySelector(target).innerHTML = '<ol>' + html + '</ol>';
}

function clearCharts() {
  var charts = document.querySelectorAll('.p-bar-chart, .p-pie-chart, .p-fill-chart');
  charts.forEach(function(chart) {
    chart.innerHTML = '';
  });
}

function buildCharts() {
  var breakpoint = 875;

  showMaxDatum('#os-architecture', dummyData.osArchitecture.dataset);
  showMaxDatum('#display-server', dummyData.displayServer.dataset);
  showMaxDatum('#one-screen', dummyData.numberScreens.dataset);
  showMaxDatum('#one-gpu', dummyData.numberGPUs.dataset);

  createBarChart('#install-or-upgrade', dummyData.installOrUpgrade.dataset);
  createBarChart('#number-of-cpus', dummyData.cpus.dataset);
  createBarChart('#size-of-ram', dummyData.ram.dataset);
  createBarChart('#pixel-density', dummyData.pixelDensity.dataset);
  createBarChart('#partition-number', dummyData.partitionNum.dataset);

  createOrderedList('#language-list', dummyData.languageList.dataset, { truncPoint: 10 });
  createHorizontalBarChart(
    '#language-list-chart',
    dummyData.languageList.dataset,
    { sort: 'ascending', truncPoint: 10, margin: { top: 20, right: 20, bottom: 20, left: 70 } }
  );

  if (window.innerWidth >= breakpoint) {
    createBarChart('#popular-screen-sizes', dummyData.screenSizes.dataset);
    createBarChart('#physical-disk', dummyData.physicalDisk.dataset);
    createBarChart('#partition-type', dummyData.partitionType.dataset);
    createBarChart('#partition-size', dummyData.partitionSize.dataset);
  } else {
    createHorizontalBarChart('#popular-screen-sizes', dummyData.screenSizes.dataset);
    createHorizontalBarChart('#physical-disk', dummyData.physicalDisk.dataset);
    createHorizontalBarChart(
      '#partition-type',
      dummyData.partitionType.dataset,
      { margin: { top: 20, right: 20, bottom: 20, left: 100 } }
    );
    createHorizontalBarChart('#partition-size', dummyData.partitionSize.dataset);
  }
}

window.addEventListener('resize', debounce(function() {
  clearCharts();
  buildCharts();
}, 250));

buildCharts();
