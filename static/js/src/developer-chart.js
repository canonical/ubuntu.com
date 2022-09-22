const hackerEarthData =  [
  {  "count": 66, "label": "Ubuntu" },
  {  "count": 61, "label": "MS Windows" },
  {  "count": 57, "label": "MacOS" },
  {  "count": 11, "label": "CentOs" },
  {  "count": 10, "label": "Debian" },
  {  "count": 9, "label": "Fedora" },
  {  "count": 8, "label": "Arch Linux" },
  {  "count": 4, "label": "Solaris" },
  {  "count": 2, "label": "FreeBSD" },
  {  "count": 1, "label": "Deepin" }
];
const OpenSourcedata =  [
  {  "count": 35.6, "label": "Ubuntu" },
  {  "count": 21.4, "label": "Debian" },
  {  "count": 19.5, "label": "CentOS" },
  {  "count": 16, "label": "RHEL" },
  {  "count": 14.6, "label": "OpenSUSE" },
  {  "count": 13.5, "label": "SLES" },
  {  "count": 11.1, "label": "SELinux" },
  {  "count": 7.5, "label": "Rocky Linux" },
  {  "count": 4.8, "label": "NavyLinux" }
];

function createChart ( dataset, id ){
  const data = dataset.sort(function (a, b) {
    return d3.ascending(a.count, b.count);
  });

  var margin = {
  top: 15,
  right: 60,
  bottom: 15,
  left: 100
  };

  var width = 500 - margin.left - margin.right,
  height = 300 - margin.top - margin.bottom;

  var svg = d3.select(`#${id}`).append("svg")
  .attr("width", width + margin.left + margin.right)
  .attr("height", height + margin.top + margin.bottom)
  .append("g")
  .attr("transform", "translate(" + margin.left + "," + margin.top + ")")

  var x = d3.scale.linear()
  .range([0, width])
  .domain([0, d3.max(data, function (d) {
      return d.count;
  })]);

  var y = d3.scale.ordinal()
  .rangeRoundBands([height, 0], .1)
  .domain(data.map(function (d) {
      return d.label;
  }));

  var yAxis = d3.svg.axis()
  .scale(y)
  .tickSize(0)
  .orient("left");

  var gy = svg.append("g")
  .attr("class", "y axis")
  .call(yAxis);

  var bars = svg.selectAll(".bar")
  .data(data)
  .enter()
  .append("g");

  bars.append("rect")
  .attr("class", "bar")
  .attr("y", function (d) {
      return y(d.label);
  })
  .attr("height", y.rangeBand())
  .attr("x", 8)
  .attr("width", function (d) {
      return x(d.count);
  })
  .attr("fill", function(d) {
    if (d.label == "Ubuntu") {
      return "#E95420";
    } else{
      return "#AEA79F";
    }
  });

  bars.append("text")
  .attr("class", "label")
  .attr("y", function (d) {
      return y(d.label) + y.rangeBand() / 2 + 4;
  })
  .attr("x", function (d) {
      return x(d.count) + 17;
  })
  .text(function (d) {
      return `${d.count}%`;
  });
}

createChart(hackerEarthData,"hackerearth-chart");
createChart(OpenSourcedata,"opensource-chart");
  
