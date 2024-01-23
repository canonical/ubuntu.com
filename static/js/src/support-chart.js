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
 * Add x-axis group to SVG
 */
function addXAxis(svg, height, margin, xAxis) {
  svg
    .append("g")
    .attr("class", "x axis")
    .attr("transform", "translate(0, " + (margin.top - 32) + ")")
    .call(xAxis);
}

/**
 *
 * @param {*} svg
 * @param {*} yAxis
 *
 * Append y-axis group to SVG
 */
function appendYAxisGroup(svg, yAxis) {
  return svg
    .append("g")
    .attr("class", "y axis")
    .call(yAxis);
}

/**
 *
 * @param {*} yAxisGroup
 * @param {*} y
 *
 * Centers labels in line with bars
 */
function transformTickText(yAxisGroup, y) {
  yAxisGroup.selectAll(".tick text")
    .attr("transform", function (d) {
      var centerOffset = y.bandwidth() / 2;
      return "translate(0, " + -centerOffset + ")";
    });
}

/**
 *
 * @param {*} textElement
 *
 * Splits the label into version number (inc. LTS if it exists)
 * and release name and puts them over two lines
 */
function formatLabel(textElement) {
  var textXValue = textElement.attr("x");
  var words = textElement.text().split("(");

  if (words[1]) {
    words[1] = "(" + words[1];
  }

  textElement.text(""); 

  textElement
    .append("tspan")
    .attr("x", textXValue)
    .attr("dy", "-0.5em")
    .text(words[0]);

  if (words.length > 1) {
    textElement
      .append("tspan")
      .attr("x", textXValue)
      .attr("dy", "1.6em")
      .text(words.slice(1).join(" "));
  }
}

/**
 *
 * @param {*} yAxisGroup
 *
 * Loops through the axis labels and calls the formatLabel
 * function on them
 */
function formatAxisLabels(yAxisGroup) {
  yAxisGroup.selectAll(".tick text")
    .call(function (t) {
      t.each(function (d) {
        formatLabel(d3.select(this));
      });
    });
}

/**
 *
 * @param {*} svg
 * @param {*} yAxis
 * @param {*} y
 *
 * Builds and appends the y-axis
 */
function addYAxis(svg, yAxis, y) {
  var yAxisGroup = appendYAxisGroup(svg, yAxis);
  transformTickText(yAxisGroup, y);
  formatAxisLabels(yAxisGroup);
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
  return ticks.map(tick => yAxisScale(tick));
}

/**
 *
 * @param {*} svg
 * @param {Int} x1
 * @param {Int} x2
 * @param {*} y
 * @param {String} strokeColor
 * @param {Int} strokeColor
 *
 * Appends a horiontal line to the SVG based on custom parameters
 */
function addHorizontalLine(svg, x1, x2, y, strokeColor, strokeWidth) {
  svg.append("line")
    .attr("x1", x1)
    .attr("x2", x2)
    .attr("y1", y)
    .attr("y2", y)
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

  const lineAdjustment = 27;

  tickPositions.forEach((posY, index) => {
    addHorizontalLine(svg, -margin.left, 0, posY - lineAdjustment, "#D9D9D9", 2);

    addHorizontalLine(svg, 0, width + margin.right, posY - lineAdjustment, "#D9D9D9", index === 0 ? 2 : 1);
  });
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

/**
 *
 * @param {*} svg
 *
 * Embolden LTS labels on y axis**
 *
 */
function emboldenLTSLabels(svg) {
  svg.selectAll(".tick text tspan").select(function () {
    var text = this.textContent;
    console.log("test", text);
    if (text.includes("LTS")) {
      this.classList.add("chart__label--bold");
    }
  });
}

/**
 *
 * @param {*} svg
 * @param {String} highlightVersion
 * 
 * Set version axis labels
 */
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
 * 
 * Set version axis labels
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
function addXAxisVerticalLines(svg, height, margin) {
  svg
    .selectAll(".x.axis .tick line")
    .attr("y1", height - margin.bottom - margin.top)
    .attr("y2", 26);
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
  var rectDimensions = 25;
  var rowHeight = rectDimensions + 5;
  var gapBetweenRectAndText = 10;
  var verticalTextAlignmentOffset = 16;

  var chartKey = d3
    .select(chartSelector)
    .append("svg")
    .attr("class", "chart-key")
    .attr("width", "550")
    .attr("height", rowHeight * taskStatusKeys.length);

  taskStatusKeys.forEach(function (key, i) {
    var keyRow = chartKey
      .append("g")
      .attr("class", "chart-key__row")
      .attr("transform", "translate(0, " + rowHeight * i + ")")
      .attr("height", rectDimensions);

    keyRow
      .append("rect")
      .attr("class", taskStatus[key])
      .attr("width", rectDimensions)
      .attr("height", rectDimensions)
      .attr("y", 0);

    keyRow
      .append("text")
      .text(formatKeyLabel(key))
      .attr("class", "chart-key__label")
      .attr("x", rectDimensions + gapBetweenRectAndText)
      .attr("y", verticalTextAlignmentOffset);
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
    "Interim release standard security maintenance (9 months)"
  );
  formattedKey = formattedKey.replace(
    "Esm",
    "LTS Expanded Security Maintenance (ESM) for Ubuntu Main (additional 5 years)"
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
export function createSupportChart(
  chartSelector,
  keySelector,
  taskTypes,
  taskStatus,
  tasks,
  taskVersions,
  removePadding,
  highlightVersion
) {
  var margin = {
    top: 12,
    right: 40,
    bottom: 20,
  };
  margin.left = calculateYAxisWidth(taskTypes);
  var rowHeight = 64;
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
  var keyAttachmentSelector = keySelector || chartSelector;
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
    .range([0, width + margin.right])
    .clamp(true);

  var y = d3
    .scaleBand()
    .domain(taskTypes)
    .rangeRound([0, height - margin.top - margin.bottom])
    .padding(0.58);

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
    .attr("height", height - margin.top - margin.bottom)
    .append("g")
    .attr("class", "gantt-chart")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height)
    .attr(
      "transform",
      "translate(" + chartTranslateX + ", " + margin.top + ")"
    );

  addBarsToChart(svg, tasks, taskStatus, x, y, highlightVersion);
  addXAxis(svg, height, margin, xAxis);
  addYAxis(svg, yAxis, y);

  if (taskVersions) {
    addVersionAxis(svg, versionAxis);
    setVersionAxisLabels(svg, taskVersions);
  }

  addXAxisVerticalLines(svg, height, margin);
  addYAxisHorizontalLines(svg, yAxis, width, margin);
  cleanUpChart(svg);
  buildChartKey(keyAttachmentSelector, taskStatus);

  setTimeout(function () {
    emboldenLTSLabels(svg);
    highlightChartRow(svg, highlightVersion);
  }, 0);
}
