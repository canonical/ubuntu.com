import { debounce } from "./utils/debounce.js";

var hackerEarthData = {
  tasks: [
    { value: 56.73, taskName: "Ubuntu" },
    { value: 31.73, taskName: "Debian" },
    { value: 25.96, taskName: "CentOS" },
    { value: 21.63, taskName: "Red Hat Enterprise Linux" },
    { value: 15.38, taskName: "Alpine Linux" },
    { value: 14.42, taskName: "Fedora" },
    { value: 11.54, taskName: "Amazon Linux" },
    { value: 10.1, taskName: "Kali Linux" },
    { value: 10.1, taskName: "Rocky Linux" },
    { value: 9.13, taskName: "Oracle Linux" },
    { value: 8.65, taskName: "OpenSUSE" },
    { value: 8.17, taskName: "Alma Linux" },
    { value: 7.21, taskName: "Linux Mint" },
    { value: 6.73, taskName: "Arch Linux" },
    { value: 6.73, taskName: "CentOS Stream" },
    { value: 4.33, taskName: "SLES" },
    { value: 3.37, taskName: "Navy Linux" },
  ],
  labels: [
    "Ubuntu",
    "Debian",
    "CentOS",
    "Red Hat Enterprise Linux",
    "Alpine Linux",
    "Fedora",
    "Amazon Linux",
    "Kali Linux",
    "Rocky Linux",
    "Oracle Linux",
    "OpenSUSE",
    "Alma Linux",
    "Linux Mint",
    "Arch Linux",
    "CentOS Stream",
    "SLES",
    "Navy Linux",
  ],
};

var openSourceData = {
  tasks: [
    { value: 37.0, taskName: "Ubuntu (Classic/Server/Core)" },
    { value: 28.0, taskName: "Raspbian/Raspberry Pi OS" },
    { value: 26.0, taskName: "Debian" },
    { value: 21.0, taskName: "Yocto Project" },
    { value: 11.0, taskName: "Other" },
    {
      value: 10.0,
      taskName: "OpenWrt or equivalent",
    },
    { value: 9.0, taskName: "Alpine" },
    { value: 8.0, taskName: "CentOS" },
    { value: 6.0, taskName: "Red Hat Enterprise Linux" },
    { value: 5.0, taskName: "Automotive Grade" },
    { value: 5.0, taskName: "Linus" },
    { value: 4.0, taskName: "Fedora/Fedora IoT" },
    { value: 2.0, taskName: "uClinux" },
    { value: 1.0, taskName: "Wind River Linux" },
    { value: 1.0, taskName: "Tizen" },
  ],
  labels: [
    "Ubuntu (Classic/Server/Core)",
    "Raspbian/Raspberry Pi OS",
    "Debian",
    "Yocto Project",
    "Other",
    "OpenWrt or equivalent",
    "Alpine",
    "CentOS",
    "Red Hat Enterprise Linux",
    "Automotive Grade",
    "Linus",
    "Fedora/Fedora IoT",
    "uClinux",
    "Wind River Linux",
    "Tizen",
  ],
};

// Global variables - used widely throughout the chart making process
var margin = {
  top: 24,
  right: 40,
  bottom: 30,
  left: 0,
};
var gapSpacing = 10;

/**
 *
 * @param {*} data
 */
function sortData(data) {
  return (data = data.sort(function (a, b) {
    return d3.ascending(a.count, b.count);
  }));
}

/**
 *
 * @param {*} svg
 * @param {Array} tasks
 * @param {*} x
 * @param {*} y
 *
 * Add bars to chart using supplied data
 */
function addBarsToChart(svg, tasks, x, y) {
  const barClass = (d) =>
    d.taskName.startsWith("Ubuntu")
      ? "chart__bar--orange"
      : "chart__bar--light-grey";
  const barWidth = (d) => x(d.value) - x(0);
  const barTransform = (d) => `translate(${x(0)},${y(d.taskName)})`;

  svg
    .selectAll(".chart")
    .data(tasks, (d) => d.taskName + d.value)
    .enter()
    .append("rect")
    .attr("class", barClass)
    .attr("y", 0)
    .attr("transform", barTransform)
    .attr("height", y.bandwidth)
    .attr("width", barWidth);
}

/**
 *
 * @param {*} svg
 * @param {Int} height
 * @param {Object} margin
 * @param {*} xAxis
 *
 * Add x-axis group to SVG
 */
function addXAxis(svg, height, margin, xAxis) {
  var xAxisGroup = svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + -margin.top + ")")
    .call(xAxis);
  xAxisGroup.selectAll(".tick text").attr("dx", 3);
}

/**
 *
 * @param {*} svg
 * @param {*} yAxis
 *
 * Append y-axis group to SVG
 */
function appendYAxisGroup(svg, yAxis) {
  return svg.append("g").attr("class", "y axis").call(yAxis);
}

/**
 *
 * @param {*} yAxisGroup
 * @param {Array} tasks
 * Example of tasks array:
 * [{taskName: "Task 1", value: 10}, {taskName: "Task 2", value: 20}, ...]
 *
 * Loops through the axis labels and calls the formatLabel
 * function on them
 */
function formatYAxisLabels(yAxisGroup, tasks) {
  yAxisGroup.selectAll(".tick text").each(function (d, i) {
    d3.select(this).text("").attr("class", "u-text--muted");
    d3.select(this).append("tspan").text(d);
    d3.select(this)
      .append("tspan")
      .text(tasks[i].value + "%")
      .attr("style", "text-anchor: end;")
      .attr("x", -gapSpacing);
  });
}

/**
 *
 * @param {*} svg
 * @param {*} yAxis
 * @param {Array} tasks
 * Example of tasks array:
 * [{taskName: "Task 1", value: 10}, {taskName: "Task 2", value: 20}, ...]
 *
 * Builds and appends the y-axis
 */
function addYAxis(svg, yAxis, tasks) {
  var yAxisGroup = appendYAxisGroup(svg, yAxis);
  formatYAxisLabels(yAxisGroup, tasks);
  addPercentageSymbol(svg);
}

function addPercentageSymbol(svg) {
  svg
    .append("text")
    .text("%")
    .attr("style", "text-anchor:end;font-weight:500;font-size:14px;")
    .attr("x", 0 - gapSpacing)
    .attr("dy", -3);
}

/**
 *
 * @param {*} yAxis
 *
 * Gets the tick positions of the y-axis
 */
function getTickPositions(yAxis) {
  const yAxisScale = yAxis.scale();
  const ticks = yAxisScale.ticks ? yAxisScale.ticks() : yAxisScale.domain();
  return ticks.map((tick) => yAxisScale(tick));
}

/**
 *
 * @param {*} svg
 * @param {Int} x1
 * @param {Int} x2
 * @param {Int} y1
 * @param {Int} y2
 * @param {String} strokeColor
 * @param {Int} strokeColor
 *
 * Appends a horiontal line to the SVG based on custom parameters
 */
function addHorizontalLine(svg, x1, x2, y1, y2, strokeColor, strokeWidth) {
  svg
    .append("line")
    .attr("x1", x1)
    .attr("x2", x2)
    .attr("y1", y1)
    .attr("y2", y2)
    .attr("stroke", strokeColor)
    .attr("stroke-width", strokeWidth);
}

/**
 *
 * @param {*} svg
 * @param {*} yAxis
 * @param {Int} width
 * @param {Obj} margin
 *
 * Find the postion of the Y-axis ticks and adds a horizontal
 * line above each label and one that spans the chart area
 */
function addYAxisHorizontalLines(svg, yAxis, width, margin) {
  const tickPositions = getTickPositions(yAxis);

  tickPositions.forEach((posY, index) => {
    addHorizontalLine(
      svg,
      -margin.left,
      -gapSpacing,
      posY - 2,
      posY - 2,
      "#D9D9D9",
      1,
    );
  });

  addHorizontalLine(
    svg,
    0,
    width + margin.right,
    tickPositions[0] - 2,
    tickPositions[0] - 2,
    "#D9D9D9",
    2,
  );
}

/**
 *
 * @param {*} svg
 *
 * Selects the <line> elements in the x-axis and extends it
 */
function addXAxisTicks(svg) {
  svg.selectAll(".x.axis .tick line").each(function () {
    d3.select(this)
      .attr("y1", 3)
      .attr("y2", 28)
      .attr("style", "stroke-dasharray:none;");
  });
}

/**
 *
 * @param {*} svg
 *
 * Clean up unwanted elements on chart put in by d3.js
 */
function cleanUpChart(svg) {
  svg.selectAll(".domain").remove();
}

/**
 *
 * @param {Array} YAxisLabels
 * @param {Int} spacePerChar
 * @param {Int} extraSpace
 *
 * Calculate the longest Y-Axis label
 */
function calculateYAxisWidth(YAxisLabels, spacePerChar, extraSpace = 0) {
  var YAxisLabelsCopy = YAxisLabels.slice();
  var longestLabel = YAxisLabelsCopy.sort(function (a, b) {
    return b.length - a.length;
  })[0];
  return longestLabel.length * spacePerChar + extraSpace;
}

/**
 *
 * @param {String} chartSelector
 * @param {Array} taskTypes
 * @param {Array} tasks
 *
 * Builds chart using supplied selector and data
 */
export function createDeveloperChart(chartSelector, taskTypes, tasks) {
  margin.left = calculateYAxisWidth(taskTypes, 11, gapSpacing);
  var rowHeight = 36;
  var highestValue = d3.max(tasks, (d) => d.value);
  var height = taskTypes.length * rowHeight + margin.bottom;
  var parent = d3.select(chartSelector);
  var containerWidth = parent.node().getBoundingClientRect().width;
  if (containerWidth <= 0) {
    var closestCol = document
      .querySelector(chartSelector)
      .closest('[class*="col-"]');

    if (closestCol.clientWidth <= 0) {
      return;
    }
    containerWidth = closestCol.clientWidth - margin.left;
  }
  var width = containerWidth - margin.right - margin.left;

  var x = d3
    .scaleLinear()
    .domain([0, highestValue + 10])
    .range([0, width + margin.right]);

  var y = d3
    .scaleBand()
    .domain(taskTypes)
    .rangeRound([0, height - margin.top - margin.bottom])
    .padding(0.1);

  var xAxis = d3.axisBottom(x).tickValues(d3.range(0, highestValue + 10, 10));

  var yAxis = d3.axisRight(y).tickPadding(-margin.left).tickSize(0);

  sortData(tasks);

  // Build initial chart body
  var svg = d3
    .select(chartSelector)
    .append("svg")
    .attr("class", "chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height - margin.top)
    .append("g")
    .attr("class", "horizontal-bar-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height)
    .attr("transform", "translate(" + margin.left + ", " + margin.top + ")");

  addBarsToChart(svg, tasks, x, y);
  addXAxis(svg, height, margin, xAxis);
  addYAxis(svg, yAxis, tasks);
  addXAxisTicks(svg);
  cleanUpChart(svg);
}

function buildCharts() {
  if (document.querySelector("#hackerearth-chart")) {
    createDeveloperChart(
      "#hackerearth-chart",
      hackerEarthData.labels,
      hackerEarthData.tasks,
    );
  }
  if (document.querySelector("#opensource-chart")) {
    createDeveloperChart(
      "#opensource-chart",
      openSourceData.labels,
      openSourceData.tasks,
    );
  }
}

function clearCharts() {
  const hackerEarthData = document.querySelector("#hackerearth-chart");
  if (hackerEarthData) {
    hackerEarthData.innerHTML = "";
  }
  const openSourceData = document.querySelector("#opensource-chart");
  if (openSourceData) {
    openSourceData.innerHTML = "";
  }
}

var mediumBreakpoint = 620;

// A bit of a hack, but chart doesn't load with full year axis on first load,
// It has to be loaded once, and then again
// This will need looking into but this fix will work for now
if (window.innerWidth >= mediumBreakpoint) {
  buildCharts();
  setTimeout(function () {
    clearCharts();
    buildCharts();
  }, 0);
}

window.addEventListener(
  "resize",
  debounce(function () {
    if (window.innerWidth >= mediumBreakpoint) {
      clearCharts();
      buildCharts();
    }
  }, 250),
);
