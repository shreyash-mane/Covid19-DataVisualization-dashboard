// globe.js
var svg = d3.select("#globe");
var tooltip = d3.select("#tooltip");
var infoBoxGlobe = d3.select("#infoBox_globe");
var backBtn = d3.select("#backBtn");
var viewMoreBtn = d3.select("#viewMoreBtn");

var isFrozen = false, rotateTimer, selectedCountry = null, countryPaths;
var covidData = [], casesByISO = {};

const csv_path = 'https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/Cleared_covid_data_final.csv';

// const colorScale = d3.scaleSequential(d3.interpolateReds).domain([0, 100]);

function startRotation() {
  rotateTimer = d3.timer(elapsed => {
    CHART_CONSTANTS.projection.rotate([elapsed * 0.02, -15]);
    countryPaths.attr("d", CHART_CONSTANTS.path);
    svg.select("path.graticule").attr("d", CHART_CONSTANTS.path);
  });
}

function stopRotation() {
  if (rotateTimer) rotateTimer.stop();
}

function resetView() {
  isFrozen = false;
  selectedCountry = null;
  document.getElementById("insightsBtn").style.display = "block";
  CHART_CONSTANTS.projection.scale(280).rotate([0, -15]);
  countryPaths.classed("dimmed", false).classed("highlighted", false);
  startRotation();
  countryPaths.attr("d", CHART_CONSTANTS.path);
  svg.select("path.graticule").attr("d", CHART_CONSTANTS.path);
  tooltip.style("display", "none");
  infoBoxGlobe.style("display", "none");
  viewMoreBtn.style("display", "none");
  backBtn.style("display", "none");
  document.getElementById("lineChartContainer").style.display = "none";
  document.getElementById("barChartContainer").style.display = "none";
  document.getElementById("globe").style.display = "block";
}

backBtn.on("click", resetView);

document.getElementById("aboutBtn").onclick = () => {
  const box = document.getElementById("aboutBox");
  box.style.display = box.style.display === "block" ? "none" : "block";
};

Promise.all([
  d3.json("https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/countries.json"),
  d3.csv('https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/Cleared_covid_data_final.csv')
]).then(([worldData, data]) => {
  covidData = data;
  const countryDataMap = {};
  
  data.forEach(d => {
    if (d.location) {
      const nameKey = d.location.trim().toLowerCase();
  
      // Safely convert numeric fields
      d.stringency_index = parseFloat(d.stringency_index);
      d.total_cases = parseFloat(d.total_cases);
      d.total_deaths = parseFloat(d.total_deaths);
  
      countryDataMap[nameKey] = d;
      
      //if (nameKey === "india") console.log("INDIA DATA:", d);
    }
  }

);

const colorScale = d3.scaleSequential(d3.interpolateReds)
  .domain([1, Math.log10(d3.max(data, d => +d.total_cases || 1))]);

  const countries = topojson.feature(worldData, worldData.objects.countries).features;

  svg.append("path").datum({ type: "Sphere" }).attr("fill", "#0b2e4a").attr("stroke", "#ccc").attr("d", CHART_CONSTANTS.path);
  svg.append("path").datum(CHART_CONSTANTS.graticule).attr("class", "graticule").attr("fill", "none").attr("stroke", "#ccc").attr("stroke-opacity", 0.2).attr("d", CHART_CONSTANTS.path);
  updateInfoBox();
  countryPaths = svg.selectAll(".country")
    .data(countries)
    .join("path")
    .attr("class", "country")
    .attr("fill", d => {
      const nameKey = d.properties.name.trim().toLowerCase();
      const countryData = countryDataMap[nameKey];
      if (countryData && !isNaN(countryData.total_cases)) {
        return colorScale(Math.log10(countryData.total_cases));
      } else {
        return "#999"; 
      }
    })
    .attr("stroke", "#111")
    .attr("d", CHART_CONSTANTS.path)
    .on("mouseover", (event, d) => {
      if (!isFrozen) {
        const nameKey = d.properties.name.trim().toLowerCase();
        const countryData = countryDataMap[nameKey];
        tooltip.style("display", "block").html(`
          <strong>${d.properties.name || "Unknown"}</strong>
          `);
      }
    })
    .on("mousemove", event => {
      tooltip.style("left", event.pageX + 10 + "px").style("top", event.pageY + 10 + "px");
    })
    .on("mouseout", () => {
      if (!isFrozen) tooltip.style("display", "none");
    })
    .on("click", function (event, d) {
      tooltip.style("display", "none");
      if (isFrozen && selectedCountry === d) {
        resetView();
        return;
      }
      if (isFrozen) return;
      isFrozen = true;
      stopRotation();
      selectedCountry = d;

      const [x, y] = d3.geoCentroid(d);
      d3.transition().duration(1250).tween("rotate", () => {
        const r = d3.interpolate(CHART_CONSTANTS.projection.rotate(), [-x, -y]);
        const s = d3.interpolate(CHART_CONSTANTS.projection.scale(), 450);
        return t => {
          CHART_CONSTANTS.projection.rotate(r(t)).scale(s(t));
          countryPaths.attr("d", CHART_CONSTANTS.path);
          svg.select("path.graticule").attr("d", CHART_CONSTANTS.path);
        };
      });

      const nameKey = d.properties.name.trim().toLowerCase();
      const countryData = countryDataMap[nameKey];

      d3.select("#infoContent").html(`
        <h3>${d.properties.name || "Unknown"}</h3>
        <p><strong>Total Cases:</strong> ${countryData && countryData.total_cases ? (+countryData.total_cases).toLocaleString() : "N/A"}</p>
        <p><strong>Total Deaths:</strong> ${countryData && countryData.total_deaths ? (+countryData.total_deaths).toLocaleString() : "N/A"}</p>
        `);

      viewMoreBtn.style("display", "block");
      d3.select(this).classed("highlighted", true);
      countryPaths.classed("dimmed", true);
      d3.select(this).classed("dimmed", false);
      infoBoxGlobe.style("display", "block");
      backBtn.style("display", "block");
    });

  startRotation();
  

  viewMoreBtn.on("click", () => {
    if (!selectedCountry) return;
    document.getElementById("infoBox").style.display = "none";
    document.getElementById("globe").style.display = "none";
    document.getElementById("infoBox_globe").style.display = "none";
    document.getElementById("tooltip").style.display = "none";
    document.getElementById("lineChartContainer").style.display = "block";
    document.getElementById("lineChartTitle").innerText = `Stringency vs Cases: ${selectedCountry.properties.name}`;
    drawLineChart(selectedCountry.properties.name, covidData);
    backBtn.style("display", "block");
  });
});

