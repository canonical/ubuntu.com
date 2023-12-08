import { debounce } from "../utils/debounce.js";

function buildChiselledChart(selector, data, isFirst) {
  const colors = ["#CBA7B8", "#923A66", "#000000"];

  var width = document.querySelector(selector).getBoundingClientRect().width;

  const x = d3.scaleLinear().range([0, width]).domain([0, 330]);

  const withScale = screen.width < 1036 || isFirst;

  const svg = d3
    .select(selector)
    .append("svg")
    .attr("width", width)
    .attr("height", `${2.5 * (data.length + (withScale ? 1 : 0))}em`);

  const xAxis = d3
    .axisTop(x)
    .ticks(3)
    .tickSizeInner(24)
    .tickSizeOuter(0);

  const axisG = svg.append("g");

  if (withScale) axisG.style("transform", "translate(0, 2.3rem)");

  axisG.call(xAxis);

  axisG.selectAll("text")
    .attr("transform", "translate(5, 20)")
    .attr("text-anchor", "start")
    .style("font-size", "1.6em")
    .style("color", "#666666");

  axisG.select(".domain")
    .attr("transform", "translate(0, -2)")
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("opacity", "0.2");

  axisG.selectAll("line")
    .attr("transform", "translate(0, -2)")
    .attr("stroke", "#000000")
    .attr("stroke-width", "1px")
    .attr("opacity", "0.2");

  const chartG = svg.append("g");

  if (withScale) chartG.style("transform", "translate(0, 2.4em)");
  
  chartG.selectAll()
    .data(data)
    .enter()
    .append("rect")
    .attr("fill", function (d, i) {
      if (i === data.length - 1) return colors[colors.length - 1];
      return colors[i];
    })
    .attr("x", 0)
    .attr("y", function (d, i) {
      return `${2.5 * i}em`;
    })
    .attr("height", "2.35em")
    .attr("width", function (d, i) {
      return x(d);
    });
}

function clearChiselledChart(selector) {
  const chart = document.querySelector(selector);
  if (chart) {
    chart.innerHTML = "";
  }
}

window.addEventListener(
  "resize",
  debounce(function () {
    clearChiselledChart("#chiselled-dotnet-chart");
    clearChiselledChart("#chiselled-java-chart");
    clearChiselledChart("#chiselled-other-chart");
    buildChiselledChart("#chiselled-dotnet-chart", [219, 116, 5], true);
    buildChiselledChart("#chiselled-java-chart", [215, 113]);
    buildChiselledChart("#chiselled-other-chart", [20, 12]);
  }, 250)
);

buildChiselledChart("#chiselled-dotnet-chart", [219, 116, 5], true);
buildChiselledChart("#chiselled-java-chart", [215, 113]);
buildChiselledChart("#chiselled-other-chart", [20, 12]);
