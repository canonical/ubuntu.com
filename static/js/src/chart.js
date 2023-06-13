/**
 *
 * @param {Array} tasks
 *
 * Sorts tasks by date
 */
function sortTasks(tasks) {
  tasks.sort(function (a, b) {
    return a.endDate - b.endDate;
  });

  tasks.sort(function (a, b) {
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
function addBarsToChart(svg, tasks, taskStatus, x, y, highlightVersion) {
  svg
    .selectAll(".chart")
    .data(tasks, function (d) {
      return d.startDate + d.taskName + d.endDate;
    })
    .enter()
    .append("rect")
    .attr("class", function (d) {
      var className = "";

      if (taskStatus[d.status] === null) {
        return "bar";
      }

      if (highlightVersion && !d.taskName.includes(highlightVersion)) {
        className += " chart__bar--transparent";
      }

      className += " " + taskStatus[d.status];

      return className;
    })
    .attr("y", 0)
    .attr("transform", function (d) {
      if (d.status === "MAIN_UNIVERSE" || d.status === "PRO_SUPPORT") {
        return (
          "translate(" +
          x(d.startDate) +
          "," +
          (y(d.taskName) - y.bandwidth()) +
          ")"
        );
      }
      return "translate(" + x(d.startDate) + "," + y(d.taskName) + ")";
    })
    .attr("height", function () {
      return y.bandwidth();
    })
    .attr("width", function (d) {
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
  svg
    .append("g")
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
  svg.append("g").attr("class", "y axis").transition().call(yAxis);
}

/**
 *
 * @param {*} svg
 * @param {*} versionAxis
 *
 * Add version axis to chart
 */
function addVersionAxis(svg, versionAxis) {
  svg.append("g").attr("class", "version axis").call(versionAxis);
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

/* @param {*} svg
 *
 * Embolden LTS labels on y axis**
 *

 */
function emboldenLTSLabels(svg) {
  svg.selectAll(".tick text").select(function () {
    var text = this.textContent;

    if (text.includes("LTS")) {
      this.classList.add("chart__label--bold");
    }
  });
}

function highlightChartRow(svg, highlightVersion) {
  svg.selectAll(".tick text").select(function () {
    var text = this.textContent;
    var isNotHighlightedVersion =
      highlightVersion && !text.includes(highlightVersion);
    var isYearLabel = text.includes("20") && !text.includes("Ubuntu ");

    if (isNotHighlightedVersion) {
      this.classList.add("chart__label--transparent");
    }

    if (isYearLabel) {
      this.classList.remove("chart__label--transparent");
    }
  });
}

/**
 *
 * @param {*} svg
 */
function setVersionAxisLabels(svg, taskVersions) {
  svg.selectAll(".version .tick text").select(function (tickLabel, index) {
    this.textContent = taskVersions[index];
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

  var chartKey = d3
    .select(chartSelector)
    .append("svg")
    .attr("class", "chart-key")
    .attr("width", "400")
    .attr("height", 24 * taskStatusKeys.length);

  taskStatusKeys.forEach(function (key, i) {
    var keyRow = chartKey
      .append("g")
      .attr("class", "chart-key__row")
      .attr("transform", "translate(0, " + 21 * i + ")")
      .attr("height", 24);

    keyRow
      .append("rect")
      .attr("class", taskStatus[key])
      .attr("width", 18)
      .attr("height", 14)
      .attr("y", 0);

    keyRow
      .append("text")
      .text(formatKeyLabel(key))
      .attr("class", "chart-key__label")
      .attr("x", 24)
      .attr("y", 13);
  });
}

/**
 *
 * @param {String} key
 *
 * Formats key into readable string
 */
function formatKeyLabel(key) {
  var keyLowerCase = key.toLowerCase().replace(/_/g, " ");
  var formattedKey =
    keyLowerCase.charAt(0).toUpperCase() + keyLowerCase.substr(1);
  formattedKey = formattedKey.replace(
    "Lts",
    "Ubuntu LTS release Standard Support"
  );
  formattedKey = formattedKey.replace(" openstack ", " OpenStack ");
  formattedKey = formattedKey.replace("kub", "Kub");
  formattedKey = formattedKey.replace(
    "Interim release",
    "Interim release Standard Support (9 months)"
  );
  formattedKey = formattedKey.replace(
    "Esm",
    "LTS expanded support for Ubuntu Main (5 years)"
  );
  formattedKey = formattedKey.replace("Cve", "CVE/Critical fixes only");
  formattedKey = formattedKey.replace("Early", "Early preview");
  formattedKey = formattedKey.replace(
    "Hardware and maintenance updates",
    "LTS standard support for Ubuntu Main"
  );
  formattedKey = formattedKey.replace(
    "Main universe",
    "LTS expanded support for Ubuntu Universe (10 years)"
  );
  formattedKey = formattedKey.replace(
    "Microstack esm",
    "Expanded Security Maintenance (ESM)"
  );
  formattedKey = formattedKey.replace(
    "Pro support",
    "Ubuntu Pro + Support coverage"
  );
  return formattedKey;
}

/**
 *
 * @param {Array} taskTypes
 *
 * Calculate the longest Y-Axis label
 */
function calculateYAxisWidth(YAxisLabels) {
  var YAxisLabelsCopy = YAxisLabels.slice();
  var longestLabel = YAxisLabelsCopy.sort(function (a, b) {
    return b.length - a.length;
  })[0];
  return longestLabel.length * 7;
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
export function createChart(
  chartSelector,
  taskTypes,
  taskStatus,
  tasks,
  taskVersions,
  removePadding,
  highlightVersion
) {
  var margin = {
    top: 0,
    right: 40,
    bottom: 20,
  };
  margin.left = calculateYAxisWidth(taskTypes);
  var rowHeight = 34;
  var timeDomainStart;
  var timeDomainEnd;
  var earliestStartDate = d3.min(tasks, (d) => d.startDate);
  var latestEndDate = d3.max(tasks, (d) => d.endDate);
  if (removePadding) {
    timeDomainStart = earliestStartDate;
    timeDomainEnd = latestEndDate;
  } else {
    timeDomainStart = d3.timeYear.offset(earliestStartDate, -1);
    timeDomainEnd = d3.timeYear.offset(latestEndDate, +1);
  }
  var height = taskTypes.length * rowHeight;
  var containerWidth = document.querySelector(chartSelector).clientWidth;
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
    .scaleTime()
    .domain([timeDomainStart, timeDomainEnd])
    .range([0, width])
    .clamp(true);

  var y = d3
    .scaleBand()
    .domain(taskTypes)
    .rangeRound([0, height - margin.top - margin.bottom])
    .padding(0.6);

  var version = d3
    .scaleBand()
    .domain(taskTypes)
    .rangeRound([0, height - margin.top - margin.bottom])
    .padding(0.4);

  var xAxis = d3.axisBottom(x);

  var yAxis = d3.axisRight(y).tickPadding(-margin.left).tickSize(0);

  var chartTranslateX = margin.left;

  if (taskVersions) {
    var versionAxis = d3
      .axisRight(version)
      .tickPadding(-margin.left * 1.6)
      .tickSize(0);

    chartTranslateX = margin.left * 1.6;
  }

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
    .attr(
      "transform",
      "translate(" + chartTranslateX + ", " + margin.top + ")"
    );

  addBarsToChart(svg, tasks, taskStatus, x, y, highlightVersion);
  addXAxis(svg, height, margin, xAxis);
  addYAxis(svg, yAxis);

  if (taskVersions) {
    addVersionAxis(svg, versionAxis);
    setVersionAxisLabels(svg, taskVersions);
  }

  addXAxisVerticalLines(svg, height);
  cleanUpChart(svg);
  buildChartKey(chartSelector, taskStatus);

  setTimeout(function () {
    emboldenLTSLabels(svg);
    highlightChartRow(svg, highlightVersion);
  }, 0);
}
