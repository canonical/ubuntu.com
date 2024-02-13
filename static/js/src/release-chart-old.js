const rowHeight = 34;
const margin = {
  top: 0,
  right: 40,
  bottom: 20,
};

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
 * @param {*} xAxis
 *
 * Add x axis to chart
 */
function addXAxis(svg, height, xAxis) {
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
function emboldenLTSLabels(svg, yScale) {
  const domain = yScale.domain();
  const tickValues = domain.map((value) => value.toString());

  svg.selectAll(".y.axis .tick text").each(function (d, i) {
    const tickText = d3.select(this);
    const textContent = tickValues[i].toString();

    if (textContent?.includes("LTS")) {
      tickText.classed("chart__label--bold", true);
    }
  });
}

function highlightChartRow(svg, scale, highlightVersion) {
  const domain = scale.domain();
  const tickValues = domain.map((value) => value.toString());

  svg.selectAll(".y.axis .tick text").each(function (d, i) {
    const tickText = d3.select(this);
    const textContent = tickValues[i].toString();

    var isNotHighlightedVersion =
      highlightVersion && !textContent.includes(highlightVersion);
    var isYearLabel =
      textContent.includes("20") && !textContent.includes("Ubuntu ");

    if (isNotHighlightedVersion) {
      tickText.classed("chart__label--transparent", true);
    }

    if (isYearLabel) {
      tickText.classed("chart__label--transparent", false);
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
 * @param {*} svg
 * @param {Int} height
 *
 * Adds vertical lines to the x axis
 */
function addYAxisVerticalLines(svg, width) {
  svg.selectAll(".y.axis .tick line").attr("x1", width);
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
    .attr("width", "550")
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
  formattedKey = formattedKey.replace("Lts", "Standard support (4-5 years)");
  formattedKey = formattedKey.replace(" openstack ", " OpenStack ");
  formattedKey = formattedKey.replace("kub", "Kub");
  formattedKey = formattedKey.replace(
    "Interim release",
    "Interim release standard security maintenance (9 months)"
  );
  formattedKey = formattedKey.replace(
    "Esm",
    "Expanded Security Maintenance (extra 5 years)"
  );
  formattedKey = formattedKey.replace("Cve", "CVE/Critical fixes only");
  formattedKey = formattedKey.replace("Early", "Early preview");
  formattedKey = formattedKey.replace(
    "Hardware and maintenance updates",
    "LTS standard security maintenance for Ubuntu Main (initial 5 years)"
  );
  formattedKey = formattedKey.replace(
    "Main universe",
    "LTS Expanded Security Maintenance (ESM) for Ubuntu Universe (10 years)"
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
export function createReleaseChartOld(
  chartSelector,
  taskTypes,
  taskStatus,
  tasks,
  taskVersions,
  removePadding,
  highlightVersion
) {
  margin.left = calculateYAxisWidth(taskTypes);
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

  addXAxis(svg, height, xAxis);
  addXAxisVerticalLines(svg, height);

  addYAxis(svg, yAxis);
  addYAxisVerticalLines(svg, width);

  addBarsToChart(svg, tasks, taskStatus, x, y, highlightVersion);

  if (taskVersions) {
    addVersionAxis(svg, versionAxis);
    setVersionAxisLabels(svg, taskVersions);
  }

  emboldenLTSLabels(svg, y);
  highlightChartRow(svg, y, highlightVersion);

  cleanUpChart(svg);
  buildChartKey(chartSelector, taskStatus);
}

/**
 *
 * @param {String} chartSelector
 * @param {Array} taskTypes
 * @param {String} taskTypesTitle
 * @param {Object} taskStatus
 * @param {Array} tasks
 * @param {Array} taskVersions
 * @param {String} taskVersionsTitle
 *
 * Builds chart using supplied selector and data
 */
export function createChartWithTitles(
  chartSelector,
  taskTypes,
  taskTypesTitle,
  taskStatus,
  tasks,
  taskVersions,
  taskVersionsTitle
) {
  if (!taskTypesTitle || !taskVersionsTitle) return;

  // build regular chart
  createReleaseChartOld(
    chartSelector,
    taskTypes,
    taskStatus,
    tasks,
    taskVersions
  );

  // adjust chart height to fit titles
  margin.left = calculateYAxisWidth(taskTypes);
  const svg = d3.select(chartSelector).select(".chart");
  const height = taskTypes.length * rowHeight;
  const newHeight = height + 30;
  svg.attr("height", newHeight);

  const chart = svg.select(".gantt-chart");
  chart
    .attr("height", newHeight)
    .attr("transform", `translate(${margin.left * 1.6}, 30)`);

  // add titles
  chart
    .append("text")
    .attr("x", -margin.left * 1.6)
    .attr("y", 0)
    .attr("dy", "0.2em")
    .text(taskVersionsTitle);

  chart
    .append("text")
    .attr("x", -margin.left)
    .attr("y", 0)
    .attr("dy", "0.2em")
    .text(taskTypesTitle);
}
