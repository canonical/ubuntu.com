fetch("/static/js/data/openstack-deployment-stats.json")
  .then((response) => response.json())
  .then((data) => {
    data.stats.sort((a, b) => b.percentage - a.percentage);
    drawChart(data.stats);
    drawTable(data.stats);
  });

const drawChart = (data) => {
  const piedata = d3.pie().value((d) => d.percentage)(data);

  const arc = d3.arc().innerRadius(90).outerRadius(180);

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
    .attr("width", 420)
    .attr("height", 420)
    .append("g")
    .attr("transform", "translate(210,210)");

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

  svg
    .append("circle")
    .attr("cx", -200)
    .attr("cy", -190)
    .attr("r", 8)
    .style("fill", "#E95420")
    .attr("z-index", "12");
  svg
    .append("text")
    .attr("x", -188)
    .attr("y", -189)
    .text("Ubuntu Server")
    .style("font-size", "18px")
    .attr("alignment-baseline", "middle");

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
      <th class="u-align--right">OpenStack coverage</th>
      <th colspan="2"></th>
    </tr>
  </thead>`;
  let tableContent = ``;
  data.forEach((d) => {
    tableContent += `<tr>
        <td>${d.name}</td>
        <td class="u-align--right">${d.percentage}</td>
        <td colspan="2"></td>
      </tr>`;
  });

  const tableContainer = document.getElementById("openstack-table");
  tableContainer.innerHTML = `<TABLE> ${tableHeadings} <tbody> ${tableContent} </tbody> </TABLE>`;
};
