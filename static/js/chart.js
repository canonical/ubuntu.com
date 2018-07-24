/**
 *
 * @param {Array} tasks
 *
 * Sorts tasks by date
 */
function sortTasks(tasks) {
  tasks.sort(function(a, b) {
    return a.endDate - b.endDate;
  });

  tasks.sort(function(a, b) {
    return a.startDate - b.startDate;
  });

  return tasks;
}


/**
 *
 * @param {*} svg
 * @param {Array} tasks
 * @param {Object} taskStatus
 * @param {*} x
 * @param {*} y
 *
 * Add bars to chart using supplied data
 */
function addBarsToChart(svg, tasks, taskStatus, x, y) {
  svg.selectAll(".chart")
    .data(tasks, function(d) {
      return d.startDate + d.taskName + d.endDate;
    })
    .enter()
    .append("rect")
    .attr("class", function(d) {
      if (taskStatus[d.status] == null) {
        return "bar";
      }
      return taskStatus[d.status];
    })
    .attr("y", 0)
    .attr("transform", function(d) {
      return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    })
    .attr("height", function(d) {
      return y.rangeBand();
    })
    .attr("width", function(d) {
      return x(d.endDate) - x(d.startDate);
    });
}


/**
 *
 * @param {*} svg
 * @param {Int} height
 * @param {Object} margin
 * @param {*} xAxis
 *
 * Add x axis to chart
 */
function addXAxis(svg, height, margin, xAxis) {
  svg.append("g")
    .attr("class", "x axis")
    .attr(
      "transform",
      "translate(0, " + (height - margin.top - margin.bottom) + ")"
    )
    .transition()
    .call(xAxis);
}


/**
 *
 * @param {*} svg
 * @param {*} yAxis
 *
 * Add y axis to chart
 */
function addYAxis(svg, yAxis) {
  svg.append("g")
    .attr("class", "y axis")
    .transition()
    .call(yAxis);
}


/**
 *
 * @param {*} svg
 *
 * Clean up unwanted elements on chart put in by d3.js
 */
function cleanUpChart(svg) {
  svg.select(".domain").remove();
}


/**
 *
 * @param {*} svg
 *
 * Embolden LTS labels on y axis
 */
function emboldenLTSLabels(svg) {
  svg.selectAll(".tick text").select(function() {
    var text = this.textContent;

    if (text.includes("LTS")) {
      this.classList.add("chart__label--bold");
    }
  });
}


/**
 *
 * @param {*} svg
 * @param {Int} height
 *
 * Adds vertical lines to the x axis
 */
function addXAxisVerticalLines(svg, height) {
  svg.selectAll(".x.axis .tick line").attr("y1", -height);
}


/**
 *
 * @param {String} chartSelector
 * @param {Object} taskStatus
 *
 * Builds key for supplied chart based on task status
 */
function buildChartKey(chartSelector, taskStatus) {
  var taskStatusKeys = Object.keys(taskStatus);

  var chartKey = d3.select(chartSelector)
    .append("svg")
    .attr("class", "chart-key")
    .attr("width", "400")
    .attr("height", 24 * taskStatusKeys.length);

  taskStatusKeys.forEach(function(key, i) {
    var keyRow = chartKey.append('g')
      .attr('class', 'chart-key__row')
      .attr('transform', 'translate(0, ' + 21 * i + ')')
      .attr('height', 24);

    keyRow
      .append('rect')
      .attr('class', taskStatus[key])
      .attr('width', 18)
      .attr('height', 14)
      .attr('y', 0);

    keyRow
      .append('text')
      .text(formatKeyLabel(key))
      .attr('class', 'chart-key__label')
      .attr('x', 24)
      .attr('y', 13);
  });
}


/**
 *
 * @param {String} key
 *
 * Formats key into readable string
 */
function formatKeyLabel(key) {
  var keyLowerCase = key.toLowerCase().replace(/_/g, ' ');
  var formattedKey = keyLowerCase.charAt(0).toUpperCase() + keyLowerCase.substr(1);

  return formattedKey;
}


/**
 *
 * @param {String} chartSelector
 * @param {Array} taskTypes
 * @param {Object} taskStatus
 * @param {Array} tasks
 *
 * Builds chart using supplied selector and data
 */
function createChart(chartSelector, taskTypes, taskStatus, tasks) {
  var margin = {
    top: 20,
    right: 40,
    bottom: 20,
    left: 180
  };
  var rowHeight = 32;
  var timeDomainStart = d3.time.year.offset(tasks[0].startDate, -1);
  var timeDomainEnd = d3.time.year.offset(tasks[tasks.length - 1].endDate, +1);
  var height = taskTypes.length * rowHeight;
  var width = document.querySelector(chartSelector).clientWidth - margin.right - margin.left;

  var x = d3.time
    .scale()
    .domain([timeDomainStart, timeDomainEnd])
    .range([0, width])
    .clamp(true);

  var y = d3.scale
    .ordinal()
    .domain(taskTypes)
    .rangeRoundBands([0, height - margin.top - margin.bottom], 0.1);

  var xAxis = d3.svg
    .axis()
    .scale(x)
    .orient("bottom")
    .ticks(d3.time.years, 1);;

  var yAxis = d3.svg
    .axis()
    .scale(y)
    .orient("left")
    .tickSize(0);

  sortTasks(tasks);

  // Build initial chart body
  var svg = d3
    .select(chartSelector)
    .append("svg")
    .attr("class", "chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("class", "gantt-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  addBarsToChart(svg, tasks, taskStatus, x, y);
  addXAxis(svg, height, margin, xAxis);
  addYAxis(svg, yAxis);
  cleanUpChart(svg);
  emboldenLTSLabels(svg);
  addXAxisVerticalLines(svg, height);
  buildChartKey(chartSelector, taskStatus);
};
