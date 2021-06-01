fetch("/static/js/data/openstack-commit-stats.json")
  .then((response) => response.json())
  .then((data) => {
    var data = data.stats.slice(0, 10);
    var tableData = "";
    var tableBody = document.querySelector(".js-commit-table tbody");
    for (var i = 0; i < data.length; i++) {
      tableData += `<tr>
      <td>${data[i].index}</td>
      <td>${data[i].name}</td>
      <td>${data[i].metric}</td>
    </tr>`;
    }
    tableBody.innerHTML = tableData;
    drawChart(data);
  });

function drawChart(data) {
  var svg = d3.select("svg.js-commit-chart"),
    width = svg.attr("width"),
    height = svg.attr("height"),
    radius = 200;

  var totals = d3.sum(data, function (d) {
    return d.metric;
  });

  data.forEach(function (d) {
    d.percentage = Math.round(100 * (d.metric / totals) * 10) / 10;
  });

  var tooltip = d3
    .select("body")
    .append("div")
    .attr("class", "tooltip")
    .style("opacity", "0")
    .style("z-index", "10")
    .style("position", "absolute")
    .style("background-color", "white")
    .style("border", "solid")
    .style("border-width", "1px")
    .style("border-radius", "3px")
    .style("padding", "3px")
    .style("pointer-events", "none");

  var container = svg
    .append("g")
    .attr("style", "transform: translate(50%, 50%)")
    .attr("text-anchor", "middle");

  var ordScale = d3
    .scaleOrdinal()
    .domain(data)
    .range(["#ffd384", "#94ebcd", "#fbaccc", "#d3e0ea", "#fa7f72"]);

  var pie = d3.pie().value(function (d) {
    return d.metric;
  });

  var arc = container.selectAll("arc").data(pie(data)).enter();

  var chartRadius = d3.arc().outerRadius(radius).innerRadius(0);

  arc
    .append("path")
    .attr("d", chartRadius)
    .attr("fill", function (d) {
      return ordScale(d.data.name);
    })
    .attr("tabindex", "0")
    .on("mouseover", function (d, i) {
      d3.select(this).transition().duration("0").attr("opacity", ".80");
      tooltip.transition().duration("0").style("opacity", "1");
      tooltip
        .html(d.data.name)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 40 + "px");
    })
    .on("mouseout", function (d, i) {
      d3.select(this).transition().duration("50").attr("opacity", "1");
      tooltip.transition().duration("50").style("opacity", "0");
    })
    .on("mousemove", function (d, i) {
      tooltip
        .html(d.data.name)
        .style("left", d3.event.pageX + "px")
        .style("top", d3.event.pageY - 40 + "px");
    });

  var label = d3.arc().outerRadius(radius).innerRadius(120);

  arc
    .append("text")
    .attr("transform", function (d) {
      return "translate(" + label.centroid(d) + ")";
    })
    .text(function (d) {
      if (d.data.percentage < 4) return "";
      return d.data.percentage + "%";
    })
    .style("pointer-events", "none")
    .style("font-family", "Ubuntu")
    .style("font-size", 15)
    .style("color", "#fff");
}
