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

  const colors = d3.scaleOrdinal(["#E95520", "#77216F", "#AEA79F"]);

  const svg = d3
    .select("#openstack-pie-chart")
    .append("svg")
    .attr("width", 400)
    .attr("height", 400)
    .append("g")
    .attr("transform", "translate(200,200)");

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
        .style("left", e.pageX - 10 + "px");
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
