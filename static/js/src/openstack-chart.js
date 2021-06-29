fetch("/static/js/data/openstack-commit-stats.json")
  .then((response) => response.json())
  .then((data) => {
    data = data.stats.slice(0, 10);
    drawChart(data);
    drawTable(data);
  });

const drawChart = (data) => {
  const totals = d3.sum(data, (d) => d.metric);
  data.forEach((d) => {
    d.percentage = Math.round(100 * (d.metric / totals) * 10) / 10;
  });
  data.reverse();

  const aspectRatio = 0.55;
  const viewWidth =
    +d3.select("#openstack-bar-chart").style("width").slice(0, -2) * 0.8;
  const viewHeight = viewWidth * aspectRatio;
  const margin = { top: 20, right: 20, bottom: 20, left: 130 };
  const percentagePosition = viewWidth / 37;
  const chartWidth = viewWidth - margin.left - margin.right;
  const chartHeight = viewHeight - margin.top - margin.bottom;
  const fontSize = viewWidth / 52;

  const svg = d3
    .select("#openstack-bar-chart")
    .append("svg")
    .attr("class", "svg")
    .attr("width", viewWidth)
    .attr("height", viewHeight);

  const y = d3
    .scaleBand()
    .range([chartHeight + margin.top, margin.top])
    .padding(0.2);

  const x = d3.scaleLinear().range([margin.left, chartWidth + margin.left]);

  y.domain(data.map((d) => d.name));
  x.domain([0, d3.max(data, (d) => +d.metric)]);

  svg
    .append("g")
    .selectAll("rect")
    .data(data)
    .enter()
    .append("rect")
    .attr("y", (d) => y(d.name))
    .attr("x", margin.left)
    .attr("height", y.bandwidth())
    .attr("width", (d) => x(d.metric) - margin.left)
    .style("fill", "#5E2750");

  svg
    .append("g")
    .attr("class", "axis")
    .attr("transform", "translate(" + (margin.left - 10) + ",0)")
    .call(d3.axisLeft(y).tickSize(0))
    .call((g) => g.select(".domain").remove());

  svg
    .append("g")
    .selectAll("text")
    .data(data)
    .enter()
    .append("text")
    .attr("class", "label-bar")
    .attr("y", (d) => y(d.name))
    .attr("x", (d) => x(d.metric))
    .attr("text-anchor", "end")
    .attr("dy", percentagePosition)
    .attr("dx", -5)
    .attr("fill", "white")
    .text((d) => d.percentage + "%");

  svg.selectAll("text").style("font-size", fontSize);
};

const drawTable = (data) => {
  const tableHeadings = `
    <thead>
      <tr>
        <th>Company</th>
        <th>Commits</th>
      </tr>
    </thead>`;
  let tableContent = ``;
  data.forEach((d) => {
    tableContent += `<tr>
        <td>${d.name}</td>
        <td>${d.metric}</td>
      </tr>`;
  });

  const tableContainer = document.getElementById("openstack-table");
  tableContainer.innerHTML = `<TABLE> ${tableHeadings} <tbody> ${tableContent} </tbody> </TABLE>`;
};
