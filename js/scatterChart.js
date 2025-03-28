// scatterChart.js

let scatterDataByDate = {};
let scatterDates = [];
let scatterInterval;
let scatterCurrentIndex = 0;
let isScatterPlaying = true;

function drawScatterChart() {
  const svg = d3.select("#scatterChart");
  svg.selectAll("*").remove();

  document.getElementById("scatterSliderWrapper").style.display = "block";
  document.getElementById("scatterPlayPause").style.display = "inline-block";
  document.getElementById("scatterPlayPause").innerText = "Pause";

  const margin = { top: 40, right: 60, bottom: 60, left: 60 },
        width = +svg.attr("width") - margin.left - margin.right,
        height = +svg.attr("height") - margin.top - margin.bottom;

  const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);

  let tooltip = d3.select("#scatterTooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body").append("div")
      .attr("id", "scatterTooltip")
      .style("position", "absolute")
      .style("background", "rgba(0, 0, 0, 0.75)")
      .style("color", "#fff")
      .style("padding", "6px 10px")
      .style("border-radius", "4px")
      .style("font-size", "12px")
      .style("pointer-events", "none")
      .style("display", "none");
  }

  // d3.csv("https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/Cleared_covid_data_final.csv")
  // https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/Cleared_covid_data_scatter_plot.csv
  d3.csv("https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/Cleared_covid_data_scatter_plot_v2.csv")
    .then(data => {
      scatterDataByDate = d3.group(data, d => d.date);

      // Reduce to unique months (YYYY-MM)
      scatterDates = Array.from(scatterDataByDate.keys())
        .map(d => {
          if (d && typeof d === "string") {
            const trimmed = d.trim();
            const parts = trimmed.includes("/") ? trimmed.split("/") : trimmed.split("-");
            if (parts.length === 3) {
              const [day, month, year] = parts;
              if (!isNaN(+year) && !isNaN(+month)) {
                return `${year}-${month.toString().padStart(2, '0')}`;
              } else {
                console.warn("Invalid year or month:", d);
              }
            } else {
              console.warn("Invalid date format (not 3 parts):", d);
            }
          } else {
            console.warn("Invalid date (not a string):", d);
          }
          return null;
        })
        .filter(v => v !== null)
        .filter((v, i, a) => a.indexOf(v) === i)
        .sort();

      const x = d3.scaleLinear().domain([0, 100]).range([0, width]);
      const y = d3.scaleLinear().domain([0, 6000]).range([height, 0]);

      g.append("g").attr("transform", `translate(0,${height})`).call(d3.axisBottom(x));
      g.append("g").call(d3.axisLeft(y));

      svg.append("text")
        .attr("x", width / 2 + margin.left)
        .attr("y", 20)
        .attr("text-anchor", "middle")
        .attr("fill", "#fff")
        .style("font-size", "16px")
        .text("Stringency Index vs Deaths per Million");

      d3.select("#scatterSlider")
        .attr("min", 0)
        .attr("max", scatterDates.length - 1)
        .attr("value", 0)
        .on("input", function () {
          scatterCurrentIndex = +this.value;
          updateScatter(scatterDates[scatterCurrentIndex], g, x, y, tooltip);
        });

      updateScatter(scatterDates[0], g, x, y, tooltip);
      startScatterAnimation(g, x, y, tooltip);
    });
}

function updateScatter(month, g, x, y, tooltip) {
  const filteredDates = Array.from(scatterDataByDate.entries()).filter(([date]) => {
    if (typeof date !== "string") return false;
    const trimmed = date.trim();
    const parts = trimmed.includes("/") ? trimmed.split("/") : trimmed.split("-");
    if (parts.length === 3) {
      const [day, monthStr, year] = parts;
      return `${year}-${monthStr.toString().padStart(2, '0')}` === month;
    }
    return false;
  });
  let combined = [].concat(...filteredDates.map(([_, records]) => records));

  const parsed = combined.filter(d => d.stringency_index && d.total_deaths_per_million).map(d => ({
    country: d.location,
    stringency: +d.stringency_index,
    deathsPerMillion: +d.total_deaths_per_million
  }));

  const circles = g.selectAll("circle").data(parsed, d => d.country);

  circles.join(
    enter => enter.append("circle")
      .attr("cx", d => x(d.stringency))
      .attr("cy", d => y(d.deathsPerMillion))
      .attr("r", 0)
      .attr("fill", "#4caf50")
      .attr("opacity", 0.7)
      .on("mouseover", function(event, d) {
        d3.select(this).transition().duration(150).attr("r", 7).attr("stroke", "#fff").attr("stroke-width", 1.5);
        tooltip.style("display", "block").html(`<strong>${d.country}</strong><br>Stringency: ${d.stringency}<br>Deaths/Million: ${d.deathsPerMillion}`);
      })
      .on("mousemove", event => {
        tooltip.style("left", (event.pageX + 10) + "px").style("top", (event.pageY - 28) + "px");
      })
      .on("mouseout", function () {
        d3.select(this).transition().duration(150).attr("r", 4).attr("stroke", "none");
        tooltip.style("display", "none");
      })
      .call(enter => enter.transition().duration(300).attr("r", 4)),
    update => update.transition().duration(300)
      .attr("cx", d => x(d.stringency))
      .attr("cy", d => y(d.deathsPerMillion)),
    exit => exit.transition().duration(200).attr("r", 0).remove()
  );

  const [year, monthNum] = month.split("-");
const date = new Date(`${year}-${monthNum}-01`);
const formattedDate = date.toLocaleDateString("en-GB", {
  month: "long",
  year: "numeric"
});
d3.select("#scatterDateLabel").text(formattedDate);
}

function startScatterAnimation(g, x, y, tooltip) {
  clearInterval(scatterInterval);
  scatterInterval = setInterval(() => {
    scatterCurrentIndex = (scatterCurrentIndex + 1) % scatterDates.length;
    updateScatter(scatterDates[scatterCurrentIndex], g, x, y, tooltip);
    d3.select("#scatterSlider").property("value", scatterCurrentIndex);
  }, 1000);
}

document.getElementById("scatterPlayPause").addEventListener("click", () => {
  const btn = document.getElementById("scatterPlayPause");
  isScatterPlaying = !isScatterPlaying;

  if (isScatterPlaying) {
    btn.innerText = "Pause";
    startScatterAnimation(
      d3.select("#scatterChart g"),
      d3.scaleLinear().domain([0, 100]).range([0, 900 - 60 - 60]),
      d3.scaleLinear().domain([0, 6000]).range([500 - 40 - 60, 0]),
      d3.select("#scatterTooltip")
    );
  } else {
    btn.innerText = "Play";
    clearInterval(scatterInterval);
  }
});

document.getElementById("backBtn").addEventListener("click", () => {
  const scatter = document.getElementById("scatterChartContainer");
  const bar = document.getElementById("barChartContainer");
  const line = document.getElementById("lineChartContainer");
  const globe = document.getElementById("globe");

  scatter.style.display = "none";
  bar && (bar.style.display = "none");
  line && (line.style.display = "none");
  globe.style.display = "block";
  document.getElementById("backBtn").style.display = "none";
  document.getElementById("scatterSliderWrapper").style.display = "none";
  document.getElementById("scatterPlayPause").style.display = "none";
});
