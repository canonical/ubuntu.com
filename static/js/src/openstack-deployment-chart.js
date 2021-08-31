fetch("/static/js/data/openstack-deployment-stats.json")
  .then((response) => response.json())
  .then((data) => {
    data.stats.sort((a, b) => b.percentage - a.percentage);
    drawChart(data.stats);
    drawTable(data);
  });

const drawChart = (data) => {
  console.log(data);
  // Get positions for each data object
  const piedata = d3.pie().value(d => d.percentage)(data);
  // Define arcs for graphing
  const arc = d3.arc().innerRadius(110).outerRadius(200);

  const colors = d3.scaleOrdinal(["#E95520", "#77216F", "#AEA79F"]);

  // Define the size and position of svg
  const svg = d3.select("#openstack-pie-chart")
          .append('svg')
          .attr('width', 600)
          .attr('height', 600)
          // .style('background-color','yellow')
          .append('g')
            .attr('transform','translate(300,300)');

  // Add tooltip
  const tooldiv = d3.select('#openstack-pie-chart')
            .append('div')
            .style('visibility','hidden')
            .style('position','absolute')
            .style('background-color', '#111')
            .style('color', '#fff')
            .style('border-radius', '0.125rem')
            .style('border', '0')
            .style('padding', '0.5rem 1rem');
  // Draw pie
  svg.append('g')
    .selectAll('path')
    .data(piedata)
    .join('path')
      .attr('d', arc)
      .attr('fill',(d,i)=>colors(i))
      .attr('stroke', 'white')
      .on('mouseover', (e,d)=>{
        console.log(e);
        console.log(d);

        tooldiv.style('visibility','visible')
            .text(`${d.data.name}:` + ' ' + `${d.data.percentage}%`);
      })
      .on('mousemove', (e,d)=>{
        tooldiv.style('top', (e.pageY-50) + 'px')
            .style('left', (e.pageX-50) + 'px');
      })
      .on('mouseout',()=>{
        tooldiv.style('visibility','hidden');
      });
};

    // .range([
    //   "#E95420",
    //   "#FDEEE9",
    //   "#FBDDD2",
    //   "#F8CCBC",
    //   "#F6BBA6",
    //   "#F4AA90",
    //   "#F29879",
    //   "#F08763",
    //   "#ED764D",
    //   "#EB6536",
    // ]);
    //.range(["#E95520", "#77216F", "#AEA79F"]);

const drawTable = (data) => {};
