function debounce(func, wait, immediate) {
  var timeout;
  return function () {
    var context = this,
      args = arguments;
    clearTimeout(timeout);
    timeout = setTimeout(function () {
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
  var sum = d3.sum(dataset, function (d) {
    return d.value
  });
  var percentage = datum * 100 / sum;

  return percentage;
}

function formatTime(localData) {
  return d3.max(localData, function (d) {
    if (d.show) {
      return Math.floor(d.value / 1000) + ':' + Math.round((d.value % 1000) * 0.1) + 's';
    }
  });
}

function formatPercentage(localData) {
  var localValue = round(d3.max(localData, function (d) {
    if (d.show) return calcPercentage(localData, d.value)
  }), 1);
  return localValue + '%';
}

function setChartLabel(format, localData) {
  var labelText = '';
  switch (format) {
    case 'time':
      labelText = formatTime(localData);
      break;
    default:
      labelText = formatPercentage(localData);
      break;
  }
  return labelText;
}

function manipulateData(data, options) {
  // Set option defaults
  options = options || {};
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : data.length;
  var sort = options.hasOwnProperty('sort') ? options.sort : undefined;
  var sortedData = data.slice();

  switch (sort) {
    case 'descending':
      sortedData.sort(function (a, b) {
        return d3.descending(a.value, b.value)
      });
      return sortedData.slice(0, truncPoint);

    case 'ascending':
      sortedData.sort(function (a, b) {
        return d3.ascending(a.value, b.value)
      });
      return sortedData.slice(sortedData.length - truncPoint, sortedData.length);

    default:
      return sortedData.slice(0, truncPoint);
  }
}

function colorShade(usageRange, colors) {
    var index = 0;
    if (usageRange <= 1) {
        index = 0;
    } else if (usageRange > 1 && usageRange <= 5) {
        index = 1;
    } else if (usageRange > 5 && usageRange <= 10) {
        index = 2;
    } else if (usageRange > 10 && usageRange <= 15) {
        index = 3;
    } else if (usageRange > 15 && usageRange <= 30) {
        index = 4;
    } else if (usageRange > 30){
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
  var margin = options.hasOwnProperty('margin') ? options.margin : {
    top: 20,
    right: 5,
    bottom: 50,
    left: 40
  };
  var colors = options.hasOwnProperty('colors') ? options.colors : ['#ed764d', '#ccc', '#925375'];
  var ordinalColors = d3.scaleOrdinal(colors);

  // Create copy of dataset and manipulate according to options
  var data = dataset.slice();
  data = manipulateData(data, {
    sort: sort,
    truncPoint: truncPoint
  });

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
    .domain(data.map(function (d) {
      return d.label
    }));

  var y = d3.scaleLinear()
    .rangeRound([height, 0])
    .domain([0, Math.ceil(d3.max(data, function (d) {
      return calcPercentage(data, d.value)
    }))]);

  // Generate axes
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x))
    .selectAll(".tick text")
    .attr("text-anchor", "middle")
    .call(wrapText, x.bandwidth());

  g.append("g")
    .call(d3.axisLeft(y)
      .tickFormat(function (d) {
        return d + '%'
      })
      .ticks(numTicks));

  // Generate bars
  g.selectAll(".p-bar-chart__bar")
    .data(data)
    .enter()
    .append("rect")
    .attr("class", "p-bar-chart__bar")
    .attr('fill', function (d, i) {
      return ordinalColors(i);
    })
    .attr("x", function (d) {
      return x(d.label)
    })
    .attr("y", function (d) {
      return y(calcPercentage(data, d.value))
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      return height - y(calcPercentage(data, d.value))
    });
}

function createHorizontalBarChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var sort = options.hasOwnProperty('sort') ? options.sort : undefined;
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : undefined;
  var numTicks = options.hasOwnProperty('ticks') ? options.ticks : 5;
  var margin = options.hasOwnProperty('margin') ? options.margin : {
    top: 20,
    right: 20,
    bottom: 20,
    left: 60
  };
  var colors = options.hasOwnProperty('colors') ? options.colors : ['#ed764d', '#ccc', '#925375'];
  var ordinalColors = d3.scaleOrdinal(colors);

  // Create copy of dataset and manipulate according to options
  var data = dataset.slice().reverse();
  data = manipulateData(data, {
    sort: sort,
    truncPoint: truncPoint
  });

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
    .domain(data.map(function (d) {
      return d.label
    }));

  var x = d3.scaleLinear()
    .range([0, width])
    .domain([0, Math.ceil(d3.max(data, function (d) {
      return calcPercentage(data, d.value)
    }))]);

  // Generate axes
  g.append("g")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x)
      .tickFormat(function (d) {
        return d + '%'
      })
      .ticks(numTicks));

  g.append("g")
    .call(d3.axisLeft(y))
    .selectAll(".tick text")
    .attr("text-anchor", "left")
    .call(wrapText, margin.left)
    .attr("transform", function () {
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
    .attr('fill', function (d, i) {
      return ordinalColors(i);
    })
    .attr("x", 1)
    .attr("y", function (d) {
      return y(d.label)
    })
    .attr("height", y.bandwidth())
    .attr("width", function (d) {
      return x(calcPercentage(data, d.value))
    });
}

function createOrderedList(target, dataset, options) {
  // Set option defaults
  options = options || {};
  var truncPoint = options.hasOwnProperty('truncPoint') ? options.truncPoint : undefined;
  var data = dataset.slice();

  var sortedList = data
    .sort(function (a, b) {
      return d3.descending(a.value, b.value)
    });
  var count = Math.min(dataset.length, truncPoint);
  var html = '';

  for (var i = 0; i < count; i++) {
    html += '<li>' + sortedList[i].label + '</li>';
  }

  document.querySelector(target).innerHTML = '<ol>' + html + '</ol>';
}

function createProgressChart(selector, dataset, options) {
  // Set option defaults
  options = options || {};
  var parentWidth = document.querySelector(selector).parentNode.clientWidth;
  var color = options.hasOwnProperty('color') ? options.color : '#ed764d';
  var size = options.hasOwnProperty('size') ? options.size : 300;
  var format = options.hasOwnProperty('format') ? options.format : 'percent';
  // Create copy of dataset
  var data = dataset.slice();
  var label = setChartLabel(format, data);

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
    .attr("y", function (d) {
      return y(calcPercentage(data, d.value))
    })
    .attr("width", x.bandwidth())
    .attr("height", function (d) {
      if (d.show) return height - y(calcPercentage(data, d.value))
    });

  // Append percentage over top of graph
  svg
    .append("text")
    .attr("class", "p-progress-chart__text")
    .attr("transform", function () {
      return "translate(" + height / 2 + "," + ((width + 20) / 2) + ")";
    })
    .attr("text-anchor", "middle")
    .text(function () {
      return label;
    });
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
  data = manipulateData(data, {
    sort: sort,
    truncPoint: truncPoint
  });

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
    .value(function (d) {
      return d.value
    });

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
    .attr('fill', function (d, i) {
      return ordinalColors(i);
    })
    .attr('d', arc);

  // Add labels to centroid of segments
  arcs.append("text")
    .attr("transform", function (d) {
      return "translate(" + arc.centroid(d) + ")";
    })
    .attr("text-anchor", "middle")
    .attr("class", "p-pie-chart__text")
    .text(function (d) {
      if (d.data.show !== false) return d.data.label
    });
}

function createMap(selector, options, mapData) {
  var options = options || {};
  var width = document.querySelector(selector).clientWidth;
  var height = document.querySelector(selector).clientHeight;

  function render(world) {
    //   Snapdata = country mapped to ids in objects
    // Get the countries and ids 
    var svg = d3.select(selector);
    var g = svg.append('g');
    var offset = width * 0.2;
    var projection = d3.geoNaturalEarth1()
        .scale(width * 0.15)
        .translate([width / 2, (height + offset) / 2])
        .precision(.1)
        .rotate([-10, 0]);
    var geoPath = d3.geoPath().projection(projection);
    var countries = topojson.feature(world, world.objects.countries).features;
    g.selectAll('path')
        .data(countries)
        .enter()
        .append('path')
        .attr('fill', function (country) {
            if (country) {
                // Return the ubuntu usage stats for the country
                var countryStat = options.countryStats.find(function(ctryStat) {
                    return parseInt(country.id, 10) === parseInt(ctryStat.id, 10);
                });

                if (countryStat) {
                    var countryRatio = (countryStat.users * 100/ countryStat.total);
                    var shade =  colorShade(countryRatio, options.legend.colors);
                    return shade;
                }
                return "#0000FF";
            }

        })
        .attr('d', geoPath);
  }

  d3.json(mapData)
    .then(render)
    .catch(function (error) {
      throw new Error(error);
    });
}

function clearCharts() {
  var charts = document.querySelectorAll('.p-bar-chart, .p-pie-chart, .p-progress-chart');
  charts.forEach(function (chart) {
    chart.innerHTML = '';
  });
}

function buildCharts() {
  var breakpoint = 875;

  showMaxDatum('#os-architecture', dummyData.osArchitecture.dataset);
  showMaxDatum('#display-server', dummyData.displayServer.dataset);
  showMaxDatum('#one-screen', dummyData.numberScreens.dataset);
  showMaxDatum('#one-gpu', dummyData.numberGPUs.dataset);

  createPieChart('#opt-in', dummyData.optIn.dataset, {
    size: 300,
    donutRadius: 100
  });
  createPieChart('#real-or-virtual', dummyData.realOrVirtual.dataset, {
    size: 300
  });
  createPieChart('#firmware', dummyData.firmware.dataset, {
    size: 200
  });

  createBarChart('#install-or-upgrade', dummyData.installOrUpgrade.dataset);
  createBarChart('#number-of-cpus', dummyData.cpus.dataset);
  createBarChart('#size-of-ram', dummyData.ram.dataset);
  createBarChart('#pixel-density', dummyData.pixelDensity.dataset);
  createBarChart('#partition-number', dummyData.partitionNum.dataset);

  createOrderedList('#language-list', dummyData.languageList.dataset, {
    truncPoint: 10
  });
  createHorizontalBarChart(
    '#language-list-chart',
    dummyData.languageList.dataset, {
      sort: 'ascending',
      truncPoint: 10,
      margin: {
        top: 20,
        right: 20,
        bottom: 20,
        left: 70
      }
    }
  );
  createMap('#where-are-users', dummyData.whereUsersAre.datasets, '/static/js/world-110m.v1.json');
  createProgressChart('#default-settings-hw', dummyData.defaultSettings.datasets.hardware);
  createProgressChart('#restrict-add-on-hw', dummyData.restrictAddOn.datasets.hardware);
  createProgressChart('#auto-login-hw', dummyData.autoLogin.datasets.hardware);
  createProgressChart('#minimal-install-hw', dummyData.minimalInstall.datasets.hardware);
  createProgressChart('#update-at-install-hw', dummyData.updateAtInstall.datasets.hardware);
  createProgressChart('#how-long-running-hw', dummyData.howLongRunning.datasets.hardware, {
    format: 'time'
  });
  createProgressChart('#configure-hw', dummyData.configure.datasets.hardware, {
    format: 'time'
  });
  createProgressChart('#default-settings-vm', dummyData.defaultSettings.datasets.virtual, {
    color: '#925375'
  });
  createProgressChart('#restrict-add-on-vm', dummyData.restrictAddOn.datasets.virtual, {
    color: '#925375'
  });
  createProgressChart('#auto-login-vm', dummyData.autoLogin.datasets.virtual, {
    color: '#925375'
  });
  createProgressChart('#minimal-install-vm', dummyData.minimalInstall.datasets.virtual, {
    color: '#925375'
  });
  createProgressChart('#update-at-install-vm', dummyData.updateAtInstall.datasets.virtual, {
    color: '#925375'
  });
  createProgressChart('#how-long-running-vm', dummyData.howLongRunning.datasets.virtual, {
    color: '#925375',
    format: 'time'
  });
  createProgressChart('#configure-vm', dummyData.configure.datasets.virtual, {
    color: '#925375',
    format: 'time'
  });

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
      dummyData.partitionType.dataset, {
        margin: {
          top: 20,
          right: 20,
          bottom: 20,
          left: 100
        }
      }
    );
    createHorizontalBarChart('#partition-size', dummyData.partitionSize.dataset);
  }
}

window.addEventListener('resize', debounce(function () {
  clearCharts();
  buildCharts();
}, 250));

buildCharts();
