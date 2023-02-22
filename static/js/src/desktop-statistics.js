import dummyData from "./dummy-data";
import { debounce } from "./utils/debounce.js";

function calcPercentage(dataset, datum) {
  var sum = d3.sum(dataset, function (d) {
    return d.value;
  });
  var percentage = (datum * 100) / sum;

  return percentage;
}

function manipulateData(data, options) {
  // Set option defaults
  options = options || {};
  var truncPoint = options.hasOwnProperty("truncPoint")
    ? options.truncPoint
    : data.length;
  var sort = options.hasOwnProperty("sort") ? options.sort : undefined;
  var sortedData = data.slice();

  switch (sort) {
    case "descending":
      sortedData.sort(function (a, b) {
        return d3.descending(a.value, b.value);
      });
      return sortedData.slice(0, truncPoint);

    case "ascending":
      sortedData.sort(function (a, b) {
        return d3.ascending(a.value, b.value);
      });
      return sortedData.slice(
        sortedData.length - truncPoint,
        sortedData.length
      );

    default:
      return sortedData.slice(0, truncPoint);
  }
}

function colorShade(usageRange, colors) {
  var index = 0;
  if (usageRange <= 0.003326016523) {
    index = 0;
  } else if (usageRange > 0.003326016523 && usageRange <= 0.01686802072) {
    index = 1;
  } else if (usageRange > 0.01686802072 && usageRange <= 0.09856266196) {
    index = 2;
  } else if (usageRange > 0.09856266196 && usageRange <= 0.427224264) {
    index = 3;
  } else if (usageRange > 0.427224264 && usageRange <= 6.826495406) {
    index = 4;
  } else if (usageRange > 6.826495406) {
    index = 5;
  }
  return colors[index];
}

function wrapText(text, width) {
  text.each(function () {
    var text = d3.select(this);
    var words = text.text().split(/\s+/).reverse();
    var word;
    var line = [];
    var lineNumber = 0;
    var lineHeight = 1.5;
    var y = text.attr("y");
    var dy = parseFloat(text.attr("dy"));
    var tspan = text
      .text(null)
      .style("font-size", "16px")
      .append("tspan")
      .attr("x", -12)
      .attr("y", y)
      .attr("dy", dy + "em");

    while ((word = words.pop())) {
      line.push(word);
      tspan.text(line.join(" "));
      if (tspan.node().getComputedTextLength() > width) {
        line.pop();
        tspan.text(line.join(" "));
        line = [word];
        tspan = text
          .append("tspan")
          .attr("x", -12)
          .attr("y", y)
          .attr("dy", ++lineNumber * lineHeight + dy + "em")
          .text(word);
      }
    }
  });
}

function createBarChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var sort = options.hasOwnProperty("sort") ? options.sort : undefined;
  var truncPoint = options.hasOwnProperty("truncPoint")
    ? options.truncPoint
    : undefined;
  var margin = options.hasOwnProperty("margin")
    ? options.margin
    : {
        top: 20,
        right: 5,
        bottom: 50,
        left: 0,
      };
  var colors = options.hasOwnProperty("colors")
    ? options.colors
    : ["#E95420", "#772953"];
  var ordinalColors = d3.scaleOrdinal(colors);

  // Create copy of dataset and manipulate according to options
  var data = dataset.slice();
  data = manipulateData(data, {
    sort: sort,
    truncPoint: truncPoint,
  });

  // Orientate svg and give it class name
  var svg = d3.select(selector).attr("class", "p-bar-chart");
  var width =
    document.querySelector(selector).getBoundingClientRect().width -
    margin.right -
    margin.left;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set axis domains and range
  var x = d3
    .scaleBand()
    .rangeRound([0, width])
    .padding(0.1)
    .domain(
      data.map(function (d) {
        return d.label;
      })
    );

  var y = d3
    .scaleLinear()
    .rangeRound([height, 0])
    .domain([
      0,
      Math.ceil(
        d3.max(data, function (d) {
          return calcPercentage(data, d.value);
        })
      ),
    ]);

  // Generate axes
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).tickSize(0).tickPadding(16))
    .selectAll(".tick text")
    .attr("text-anchor", "middle")
    .call(wrapText, x.bandwidth());

  // remove the x axis lines at the bottom
  g.selectAll(".domain").remove();

  // Generate bars
  g.selectAll(".p-bar-chart__bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "p-bar-chart__bar")
    .attr("fill", function (d, i) {
      return ordinalColors(i);
    })
    .attr("x", function (d) {
      return x(d.label);
    })
    .attr("y", function (d) {
      return y(calcPercentage(data, d.value));
    })
    .attr("width", x.bandwidth() - 24)
    .attr("height", function (d) {
      return height - y(calcPercentage(data, d.value));
    });

  // Add text to the top of the bar
  g.append("g")
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .style("font-size", "16px")
    .attr("x", function (d) {
      return x(d.label) + x.bandwidth() / 2 - 24;
    })
    .attr("dy", "-10px") // add padding to top of bar
    .attr("y", function (d) {
      return y(calcPercentage(data, d.value));
    })
    .attr("class", "label")
    .text(function (d) {
      return Math.floor(calcPercentage(data, d.value), 1) + "%";
    });
}

function createHorizontalBarChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var sort = options.hasOwnProperty("sort") ? options.sort : undefined;
  var truncPoint = options.hasOwnProperty("truncPoint")
    ? options.truncPoint
    : undefined;
  var margin = options.hasOwnProperty("margin")
    ? options.margin
    : {
        top: 20,
        right: 30,
        bottom: 20,
        left: 60,
      };
  var colors = options.hasOwnProperty("colors")
    ? options.colors
    : ["#E95420", "#772953"];
  var ordinalColors = d3.scaleOrdinal(colors);
  var chartTitle = options.hasOwnProperty("title") ? options.title : undefined;

  // Create copy of dataset and manipulate according to options
  var data = dataset.slice().reverse();
  data = manipulateData(data, {
    sort: sort,
    truncPoint: truncPoint,
  });

  // Orientate svg and give it class name
  var svg = d3.select(selector).attr("class", "p-bar-chart");
  var width =
    document.querySelector(selector).getBoundingClientRect().width -
    margin.right -
    margin.left;
  var height = +svg.attr("height") - margin.top - margin.bottom;
  var g = svg
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // Set axis domains and range
  var y = d3
    .scaleBand()
    .range([height, 0])
    .padding(0.5)
    .domain(
      data.map(function (d) {
        return d.label;
      })
    );

  var x = d3
    .scaleLinear()
    .range([0, width])
    .domain([
      0,
      Math.ceil(
        d3.max(data, function (d) {
          return calcPercentage(data, d.value);
        })
      ),
    ]);

  // Generate bars
  g.selectAll(".p-bar-chart__bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "p-bar-chart__bar")
    .attr("fill", function (d, i) {
      return ordinalColors(i);
    })
    .attr("x", -3)
    .attr("y", function (d, i) {
      if (chartTitle) {
        if (i > 0) {
          return y(d.label) + y.bandwidth() / 2 - 10;
        } else {
          return y(d.label) + y.bandwidth() / 2;
        }
      }
      return y(d.label);
    })
    .attr("height", "16px")
    .attr("width", function (d) {
      return x(calcPercentage(data, d.value));
    });

  //add a value label to the right of each bar
  g.selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .style("font-size", "14px")
    .attr("x", function (d) {
      return x(calcPercentage(data, d.value)) + 4;
    })
    .attr("y", function (d, i) {
      if (chartTitle) {
        if (i > 0) {
          return y(d.label) + y.bandwidth() / 2 + 4;
        } else {
          return y(d.label) + y.bandwidth() / 2 + 12;
        }
      }
      return y(d.label) + y.bandwidth() / 2 + 4;
    })
    .attr("class", "label")
    .text(function (d) {
      return Math.floor(calcPercentage(data, d.value), 1) + "%";
    });

  // Add text to the left Axis
  if (chartTitle) {
    g.selectAll("text.left-axis")
      .data(data)
      .enter()
      .append("text")
      .attr("class", "left-axis")
      .attr("x", function () {
        return -70;
      })
      .attr("y", function (d) {
        return y(d.label) + y.bandwidth() / 2 + 5 - y.bandwidth();
      })
      .attr("class", "label")
      .text(function (d, i) {
        if (i % 2 === 0) return chartTitle;
      });
  } else {
    g.selectAll("text.left-axis")
      .data(data)
      .enter()
      .append("text")
      .attr("text-anchor", "end")
      .attr("class", "left-axis")
      .attr("x", "-10")
      .attr("y", function (d) {
        return y(d.label) + y.bandwidth() / 2 + 4;
      })
      .text(function (d) {
        return d.label;
      });
  }
}

function createPieChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var parentWidth = document.querySelector(selector).parentNode.clientWidth;
  var sort = options.hasOwnProperty("sort") ? options.sort : undefined;
  var truncPoint = options.hasOwnProperty("truncPoint")
    ? options.truncPoint
    : undefined;
  var colors = options.hasOwnProperty("colors")
    ? options.colors
    : ["#E95420", "#CCC", "#772953"];
  var donutRadius = options.hasOwnProperty("donutRadius")
    ? options.donutRadius
    : 15;
  var size = options.hasOwnProperty("size") ? options.size : parentWidth;
  var ordinalColors = d3.scaleOrdinal(colors);
  var labelKey = options.hasOwnProperty("centreLabel")
    ? options.centreLabel.title
    : undefined;
  var noStats = options.hasOwnProperty("noStats") ? options.noStats : false;
  var centreText = undefined;
  // Create copy of dataset and manipulate according to options
  var data = dataset.slice();

  if (labelKey && !noStats) {
    // Sum all the data
    var sum = d3.sum(data, function (d) {
      return d.value;
    });

    var labelData = data.find(function (d) {
      return d.label.toUpperCase() === labelKey.toUpperCase();
    });

    centreText =
      labelData && labelData.value
        ? Math.floor((labelData.value / sum) * 100) + "%"
        : "";
  }

  data = manipulateData(data, {
    sort: sort,
    truncPoint: truncPoint,
  });

  // Orientate svg
  size = Math.min(size, parentWidth);
  var svg = d3
    .select(selector)
    .attr("height", size)
    .attr("width", size)
    .attr("class", "p-pie-chart");
  var radius = size / 2;
  var g = svg
    .append("g")
    .attr("transform", "translate(" + radius + "," + radius + ")");

  // Generate pie values
  var pie = d3.pie().value(function (d) {
    return d.value;
  });

  // Generate the arcs
  var arc = d3.arc().innerRadius(donutRadius).outerRadius(radius);

  // Generate the groups
  var arcs = g
    .selectAll(".p-pie-chart__wedge")
    .data(pie(data))
    .enter()
    .append("g")
    .attr("class", "p-pie-chart__wedge");

  // Draw arc paths
  arcs
    .append("path")
    .attr("fill", function (d, i) {
      return ordinalColors(i);
    })
    .attr("d", arc);

  // Add labels to centre
  arcs
    .append("text")
    .text(centreText ? centreText : "")
    .attr("text-anchor", "middle")
    .attr("dy", centreText ? -5 : 0)
    .attr("class", "p-heading--2");
  arcs
    .append("text")
    .text(labelKey ? labelKey : "")
    .attr("dy", centreText ? 30 : 0)
    .attr("text-anchor", "middle")
    .attr("class", "p-pie-chart__text");
}

function createMap(selector, options, mapData, countryNamesAndIds) {
  options = options || {};
  var element = document.querySelector(selector).getBoundingClientRect();
  var width = element.width;
  var height = element.height;

  function render(countryNamesData, world) {
    //   Snapdata = country mapped to ids in objects
    // Get the countries and ids
    d3.select(selector).html("");
    var svg = d3
      .select(selector)
      .append("svg")
      .attr("class", "p-map-chart")
      .attr("width", width)
      .attr("height", height);

    var g = svg.append("g");
    var tooltip = d3.select(selector).append("div").attr("class", "p-tooltip");
    var tooltipMessage = tooltip
      .append("div")
      .attr("class", "p-tooltip__message p-tooltip__message--padding")
      .style("display", "none")
      .attr("role", "tooltip");
    var offset = width * 0.1;
    var projection = d3
      .geoNaturalEarth1()
      .scale(width * 0.2)
      .translate([width / 2, (height + offset) / 2])
      .precision(0.1);
    var geoPath = d3.geoPath().projection(projection);
    var countries = topojson.feature(world, world.objects.countries).features;
    g.selectAll("path")
      .data(countries)
      .enter()
      .append("path")
      .attr("fill", function (country) {
        if (country) {
          // Return the ubuntu usage stats for the country
          var countryStat = options.countryStats.find(function (ctryStat) {
            return parseInt(country.id, 10) === parseInt(ctryStat.id, 10);
          });

          if (countryStat) {
            var shade = colorShade(countryStat.users, options.legend.colors);
            return shade;
          }
          return "#fed6ca";
        }
      })
      .attr("stroke", "#FFFFFF")
      .attr("stroke-width", "0.25px")
      .attr("d", geoPath)
      .attr("id", function (d) {
        return d.id;
      })
      .attr("title", function (d) {
        return d.properties.name;
      })
      .on("mousemove", function (country) {
        var position = d3.mouse(g.node());
        // Check that country id starts with a zero trim the leading zeros
        country.id =
          country.id.charAt(0) === "0" ? country.id.substr(1) : country.id;
        var countryName = countryNamesData.find(function (ctryName) {
          return ctryName.id === country.id;
        });
        var countryStat = options.countryStats.find(function (ctryStat) {
          return parseInt(country.id, 10) === parseInt(ctryStat.id, 10);
        });
        if (countryName) {
          var tooltipLocation = "";
          var rightOffset = width - 100;
          // Check where the top and left axis start from for each tooltip and reposition the tooltip message
          if (position[0] < 150) {
            tooltipLocation = "p-tooltip p-tooltip--right";
          } else if (position[1] < 50 && position[0] > 150) {
            tooltipLocation = "p-tooltip p-tooltip--bottom-right";
          } else if (position[1] < 50) {
            tooltipLocation = "p-tooltip p-tooltip--bottom-center";
          } else if (position[0] > rightOffset) {
            tooltipLocation = "p-tooltip p-tooltip--left";
          } else {
            tooltipLocation = "p-tooltip p-tooltip--top-center";
          }
          tooltip
            .attr("class", tooltipLocation)
            .style("top", position[1] + "px")
            .style("left", position[0] + "px")
            .style("display", "block")
            .style("position", "absolute")
            .style("opacity", "1");
          var noOfUsers =
            countryStat.users.toFixed(1) < 1
              ? "< 0.1"
              : countryStat.users.toFixed(1);

          // unhiding the tooltip message tom prevent tooltip from showing when no country has been hovered over
          tooltipMessage.style("display", "block");
          tooltipMessage.html(
            `<span>${countryName.name}:</span><span>&nbsp; ${noOfUsers}%</span>`
          );
        }
      })
      .on("mouseout", function () {
        tooltip.style("display", "none");
      });
  }

  d3.tsv(countryNamesAndIds)
    .then(function (countryNamesData) {
      d3.json(mapData)
        .then(function (world) {
          return render(countryNamesData, world);
        })
        .catch(function (error) {
          throw new Error(error);
        });
    })
    .catch(function (error) {
      throw new Error(error);
    });
}

function clearCharts() {
  var charts = document.querySelectorAll(
    ".p-bar-chart, .p-pie-chart, .p-progress-chart"
  );
  charts.forEach(function (chart) {
    chart.innerHTML = "";
  });
}

function buildCharts() {
  var breakpoint = 875;

  createPieChart("#what-graphics-one-screen", dummyData.numberScreens.dataset, {
    colors: ["#E95420", "#CCC"],
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "One Screen",
    },
  });
  createPieChart("#what-graphics-one-gpu", dummyData.numberGPUs.dataset, {
    colors: ["#772953", "#CCC"],
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "One GPU",
    },
  });

  createPieChart("#opt-in", dummyData.optIn.dataset, {
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "Opt-In",
    },
  });
  createPieChart("#real-or-virtual", dummyData.realOrVirtual.dataset, {
    size: 184,
    donutRadius: 76,
  });
  createPieChart("#firmware-hw", dummyData.firmware.datasets.hardware, {
    colors: ["#772953", "#E95420", "#CCC"],
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "Physical",
    },
    noStats: true,
  });

  createPieChart("#os-architecture", dummyData.osArchitecture.dataset, {
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "amd64",
    },
  });
  createPieChart("#display-server", dummyData.displayServer.dataset, {
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "X11",
    },
  });

  createHorizontalBarChart(
    "#install-or-upgrade-vm",
    dummyData.installOrUpgrade.dataset,
    {
      sort: "ascending",
      truncPoint: 10,
      margin: {
        top: 5,
        right: 40,
        bottom: 20,
        left: 100,
      },
    }
  );
  createBarChart("#number-of-cpus", dummyData.cpus.dataset, {
    colors: ["#E95420", "#772953"],
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: -10,
    },
  });
  createBarChart("#size-of-ram", dummyData.ram.dataset, {
    colors: ["#E95420", "#772953"],
    margin: {
      top: 20,
      right: 20,
      bottom: 30,
      left: -10,
    },
  });
  createBarChart("#pixel-density", dummyData.pixelDensity.dataset);
  createBarChart("#partition-number", dummyData.partitionNum.dataset);

  createMap(
    "#where-are-users",
    dummyData.whereUsersAre.datasets,
    "/static/js/data/world-110m.v1.json",
    "/static/js/data/world-110m-country-names.tsv"
  );
  createPieChart(
    "#default-settings-hw",
    dummyData.defaultSettings.datasets.hardware,
    {
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Physical",
      },
    }
  );
  createPieChart(
    "#restrict-add-on-hw",
    dummyData.restrictAddOn.datasets.hardware,
    {
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Physical",
      },
    }
  );
  createPieChart("#auto-login-hw", dummyData.autoLogin.datasets.hardware, {
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "Physical",
    },
  });
  createPieChart(
    "#minimal-install-hw",
    dummyData.minimalInstall.datasets.hardware,
    {
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Physical",
      },
    }
  );
  createPieChart(
    "#update-at-install-hw",
    dummyData.updateAtInstall.datasets.hardware,
    {
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Physical",
      },
    }
  );

  createPieChart(
    "#default-settings-vm",
    dummyData.defaultSettings.datasets.virtual,
    {
      colors: ["#772953", "#ccc", "#E95420"],
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Virtual",
      },
    }
  );
  createPieChart("#firmware-vm", dummyData.firmware.datasets.virtual, {
    colors: ["#772953", "#E95420", "#CCC"],
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "Virtual",
    },
    noStats: true,
  });
  createPieChart(
    "#restrict-add-on-vm",
    dummyData.restrictAddOn.datasets.virtual,
    {
      colors: ["#772953", "#CCC", "#E95420"],
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Virtual",
      },
    }
  );
  createPieChart("#auto-login-vm", dummyData.autoLogin.datasets.virtual, {
    colors: ["#772953", "#CCC", "#E95420"],
    size: 184,
    donutRadius: 76,
    centreLabel: {
      title: "Virtual",
    },
  });
  createPieChart(
    "#minimal-install-vm",
    dummyData.minimalInstall.datasets.virtual,
    {
      colors: ["#772953", "#CCC", "#E95420"],
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Virtual",
      },
    }
  );
  createPieChart(
    "#update-at-install-vm",
    dummyData.updateAtInstall.datasets.virtual,
    {
      colors: ["#772953", "#CCC", "#E95420"],
      size: 184,
      donutRadius: 76,
      centreLabel: {
        title: "Virtual",
      },
    }
  );

  createHorizontalBarChart(
    "#popular-screen-sizes",
    dummyData.screenSizes.dataset,
    {
      margin: {
        top: 20,
        right: 30,
        bottom: 20,
        left: 100,
      },
    }
  );

  createHorizontalBarChart("#partition-size", dummyData.partitionSize.dataset);
  if (window.innerWidth >= breakpoint) {
    createBarChart("#language-list-chart", dummyData.languageList.dataset, {
      sort: "descending",
      margin: {
        top: 40,
        right: 10,
        bottom: 60,
        left: 10,
      },
    });
    createBarChart("#physical-disk", dummyData.physicalDisk.dataset, {
      colors: ["#E95420", "#772953"],
    });
    createBarChart("#partition-type", dummyData.partitionType.dataset, {
      sort: "descending",
      margin: {
        top: 20,
        right: 20,
        bottom: 70,
        left: 0,
      },
    });
  } else {
    createHorizontalBarChart("#physical-disk", dummyData.physicalDisk.dataset, {
      colors: ["#E95420", "#772953"],
    });
    createHorizontalBarChart(
      "#partition-type",
      dummyData.partitionType.dataset,
      {
        margin: {
          top: 20,
          right: 40,
          bottom: 20,
          left: 240,
        },
      }
    );
    createHorizontalBarChart(
      "#language-list-chart",
      dummyData.languageList.dataset,
      {
        sort: "ascending",
        margin: {
          top: 20,
          right: 50,
          bottom: 20,
          left: 100,
        },
      }
    );
  }
}

window.addEventListener(
  "resize",
  debounce(function () {
    clearCharts();
    buildCharts();
  }, 250)
);

buildCharts();
