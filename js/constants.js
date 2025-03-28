// constants.js
var CHART_CONSTANTS = {
  width: 960,
  height: 600,
  margin: {
    lineChart: { top: 30, right: 60, bottom: 30, left: 60 },
    barChart: { top: 40, right: 150, bottom: 60, left: 80 }
  },
  projection: d3.geoOrthographic()
    .scale(280)
    .translate([960 / 2, 600 / 2])
    .clipAngle(90),
  graticule: d3.geoGraticule10(),
  colorScale: d3.scaleSequential(d3.interpolateReds).domain([0, 100])
};

CHART_CONSTANTS.path = d3.geoPath().projection(CHART_CONSTANTS.projection);
