fetch("/static/js/data/openstack-deployment-stats.json")
  .then((response) => response.json())
  .then((data) => {
    data.stats.sort((a, b) => b.percentage - a.percentage);
    drawChart(data.stats);
    drawTable(data.stats);
  });

const drawChart = (data) => {
  const piedata = d3.pie().value((d) => d.percentage)(data);

  const arc = d3.arc().innerRadius(60).outerRadius(120);

  const colors = d3.scaleOrdinal([
    "#E95420",
    "#D6D6D6",
    "#C2C2C2",
    "#ADADAD",
    "#999999",
    "#858585",
    "#707070",
    "#5C5C5C",
    "#474747",
    "#333333",
  ]);

  const svg = d3
    .select("#openstack-pie-chart")
    .append("svg")
    .attr("width", 630)
    .attr("height", 360)
    .append("g")
    .attr("transform", "translate(120,180)");

  const tooltip = d3
    .select("body")
    .append("div")
    .style("visibility", "hidden")
    .style("position", "absolute")
    .style("z-index", "11")
    .style("pointer-events", "none")
    .style("background-color", "#111")
    .style("color", "#fff")
    .style("border-radius", "0.125rem")
    .style("border", "0")
    .style("padding", "0.5rem 1rem");

  const link = d3
    .select("body")
    .append("div")
    .html(
      '<a href="https://www.openstack.org/analytics/">OpenStack User Survey 2020</a>'
    )
    .style("position", "absolute")
    .attr("cx", "130")
    .attr("cy", "-120");

  svg
    .selectAll("ledgend-dots")
    .data(piedata)
    .enter()
    .append("circle")
    .attr("cx", 140)
    .attr("cy", function (d, i) {
      return -130 + i * 30;
    })
    .attr("r", 7)
    .style("fill", function (d, i) {
      return colors(i);
    });

  svg
    .selectAll("ledgend-label-names")
    .data(piedata)
    .enter()
    .append("text")
    .attr("x", 160)
    .attr("y", function (d, i) {
      return -130 + i * 30;
    })
    .style("fill", function (d) {
      return "#111";
    })
    .text(function (d) {
      return d.data.name;
    })
    .attr("text-anchor", "left")
    .attr("font-size", "14px")
    .attr("width", "10px")
    .style("alignment-baseline", "middle");

  svg
    .selectAll("ledgend-label-percentages")
    .data(piedata)
    .enter()
    .append("text")
    .attr("x", 380)
    .attr("y", function (d, i) {
      return -130 + i * 30;
    })
    .style("fill", function (d) {
      return "#111";
    })
    .text(function (d) {
      return d.data.percentage + `%`;
    })
    .attr("font-size", "14px")
    .style("text-anchor", "end")
    .style("alignment-baseline", "middle");

  svg
    .append("g")
    .selectAll("path")
    .data(piedata)
    .join("path")
    .attr("d", arc)
    .attr("fill", (d, i) => colors(i))
    .attr("stroke", "white")
    .on("mouseover", (e, d) => {
      tooltip
        .style("visibility", "visible")
        .text(`${d.data.name}:` + " " + `${d.data.percentage}%`);
    })
    .on("mousemove", (e, d) => {
      tooltip
        .style("top", e.pageY - 50 + "px")
        .style("left", e.pageX - 100 + "px");
    })
    .on("mouseout", () => {
      tooltip.style("visibility", "hidden");
    });
};

const drawTable = (data) => {
  const tableHeadings = `
  <thead>
    <tr>
      <th>Company</th>
      <th colspan="1"></th>
      <th class="u-align--right">OpenStack coverage</th>
    </tr>
  </thead>`;
  let tableContent = ``;
  data.forEach((d) => {
    tableContent += `<tr>
        <td>${d.name}</td>
        <td colspan="1"></td>
        <td class="u-align--right">${d.percentage}</td>
      </tr>`;
  });

  const tableContainer = document.getElementById("openstack-table");
  tableContainer.innerHTML = `<TABLE> ${tableHeadings} <tbody> ${tableContent} </tbody> </TABLE>`;
};
