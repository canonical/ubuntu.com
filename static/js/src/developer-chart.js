const hackerEarthData = [
  { count: 66, label: "Ubuntu" },
  { count: 61, label: "MS Windows" },
  { count: 57, label: "MacOS" },
  { count: 11, label: "CentOs" },
  { count: 10, label: "Debian" },
  { count: 9, label: "Fedora" },
  { count: 8, label: "Arch Linux" },
  { count: 4, label: "Solaris" },
  { count: 2, label: "FreeBSD" },
  { count: 1, label: "Deepin" },
];
const openSourceData = [
  { count: 35.6, label: "Ubuntu" },
  { count: 21.4, label: "Debian" },
  { count: 19.5, label: "CentOS" },
  { count: 16, label: "RHEL" },
  { count: 14.6, label: "OpenSUSE" },
  { count: 13.5, label: "SLES" },
  { count: 11.1, label: "SELinux" },
  { count: 7.5, label: "Rocky Linux" },
  { count: 4.8, label: "NavyLinux" },
];

/**
 * 
 * @param {*} data 
 * @param {*} id 
 */
function sortData(data) {
  return data = data.sort(function (a, b) {
    return d3.ascending(a.count, b.count);
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
 * @param {Array} taskTypes
 *
 * Calculate the longest Y-Axis label
 */
function calculateMaxLabelWidth(YAxisLabels) {
  var YAxisLabelsCopy = YAxisLabels.slice();
  var longestLabel = YAxisLabelsCopy.sort(function (a, b) {
    return b.length - a.length;
  })[0];
  return longestLabel.length * 7;
}

function createChart(data, id) {
  sortData(data);
  var parent = d3.select(`#${id}`);
  var parentWidth = parent.node().getBoundingClientRect().width;
  var margin = {
    top: 30,
    right: 140,
    bottom: 15,
    left: 70,
  };
  var rowHeight = 40;
  var width = parentWidth - margin.left - margin.right;
  var height = (data.length * rowHeight);

  var svg = d3
    .select(`#${id}`)
    .append("svg")
    .attr("class", "developer-chart");

  var g = svg.append("g");

  var x = d3.scale.linear().domain([
    0,
    d3.max(data, function (d) {
      return d.count;
    }),
  ]);

  var y = d3.scale
    .ordinal()
    .rangeRoundBands([height, margin.top], 0.05)
    .domain(
      data.map(function (d) {
        return d.label;
      })
    );

  // Attach OS labels
  const yAxis = d3.svg.axis().scale(y).tickSize(0).orient("left");
  const osLabels = svg.append("g").attr("class", "OS-labels").attr("y", 0).call(yAxis);
  // modify existing tick texts (created by D3's axis generator, hense the set timeout)
  setTimeout(() => {
    osLabels.selectAll(".tick text").attr("x", 0).style("text-anchor", "start");
  }, 0);

  // Attach percentage labels
  const percentageLabels = svg
  .append("g")
  .attr("class", "percentage-labels")
  .attr("transform", "translate(" + margin.left + ",0)");

  // Adding the percentage values
  percentageLabels
    .selectAll(null)
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label")
    .attr("y", function (d) {
      return y(d.label) + y.rangeBand() / 2 + 4;
    })
    .attr("x", margin.left - 10)
    .style("text-anchor", "end")
    .text(function (d) {
      return `${d.count}%`;
    });

  percentageLabels.append("text")
    .attr("class", "percentage-symbol")
    .attr("x", margin.left + 4)
    .attr("y", margin.top)
    .style("text-anchor", "end")
    .style("font-weight", "500")
    .text('%');

  // Attach lines above labels
  const linePositions = data.map((d, i) => {
    const yBottom =
      i === 0 ? -y.rangeBand() / 2 : y(data[i - 1].label) + y.rangeBand();
    const yTop = y(d.label);
    if (i === 0) {
      return margin.top + 3;
    }
    return (yBottom + yTop) / 2;
  });
  svg
    .selectAll(".line")
    .data(linePositions)
    .enter()
    .append("line")
    .attr("class", "line")
    .attr("x1", 0)
    .attr("x2", margin.right + 5)
    .attr("y1", (d) => d)
    .attr("y2", (d) => d)
    .attr("stroke", "#ccc") // You can set the line color here
    .attr("stroke-width", 1); // You can set the line width here


  // Attach top axis ticks
  var topAxis = d3.svg.axis().scale(x).orient("top").tickSize(-10).tickFormat(d3.format("d"));
  var tickValues = d3.range(0, d3.max(data, d => d.count) + 10, 10);
  console.log(tickValues)
  topAxis.tickValues(tickValues);
  svg.append("g")
    .attr("class", "top-axis")
    .attr("transform", "translate(" + (margin.right + 40) + "," + margin.top + ")")
    .call(topAxis);

  svg.selectAll(".top-axis-line")
  .data(tickValues)
  .enter()
  .append("line")
  .attr("class", "top-axis-line")
  .attr("x1", d => x(d) + margin.right + 40)
  .attr("x2", d => x(d) + margin.right + 40)
  .attr("y1", margin.top)
  .attr("y2", margin.top + 10) // Length of the small line
  .attr("stroke", "black") // or any color you prefer
  .attr("stroke-width", 1);


  // Attach bars
  var barsGroup = svg.append("g").attr("class", "bars");
  var bars = barsGroup
    .selectAll(".bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("y", function (d) {
      return y(d.label);
    })
    .attr("height", y.rangeBand())
    .attr("x", 0)
    .attr("width", function (d) {
      return x(d.count);
    })
    .attr("fill", function (d) {
      if (d.label == "Ubuntu") {
        return "#E95420";
      } else {
        return "#AEA79F";
      }
    });

  // Handle resizing
  var update = function () {
    svg.attr(
      "viewBox",
      `0 0 ${width + margin.left + margin.right} ${
        height + margin.top + margin.bottom
      }`
    );

    barsGroup.attr(
      "transform",
      "translate(" + (margin.right - 35) + ",0)"
    );

    g.attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    x.range([0, width]);
    y.rangeRoundBands([height, margin.top], 0.1);

    svg.select(".top-axis").call(topAxis);

    svg
      .selectAll(".bar")
      .attr("x", margin.left)
      .attr("width", function (d) {
        return x(d.count);
      });

    osLabels.call(yAxis);

    svg
      .selectAll(".label")
      .attr("y", function (d) {
        return y(d.label) + y.rangeBand() / 2 + 4;
      })
      .attr("x", margin.left + 5);

    cleanUpChart(svg);
  };

  update();

  d3.select(window).on("resize", function () {
    parentWidth = parent.node().getBoundingClientRect().width;
    width = parentWidth - margin.left - margin.right;

    update();
  });

  cleanUpChart(svg);
}

function buildCharts() {
  if (document.querySelector("#hackerearth-chart")) {
    createChart(
      hackerEarthData,
      "hackerearth-chart"
    );
  }
  if (document.querySelector("#opensource-chart")) {
    createChart(
      openSourceData,
      "opensource-chart",
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
  }, 250)
);