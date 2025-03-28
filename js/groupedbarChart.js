function drawGroupedBarChart() {
  const svg = d3.select("#barChart");
  svg.selectAll("*").remove();
  document.getElementById("infoBox_globe").style.display = "none";

  const tooltip = d3.select("body")
    .append("div")
    .attr("class", "chart-tooltip")
    .style("position", "absolute")
    .style("visibility", "hidden")
    .style("background", "rgba(0,0,0,0.8)")
    .style("color", "white")
    .style("padding", "6px 10px")
    .style("border-radius", "4px")
    .style("font-size", "12px")
    .style("pointer-events", "none")
    .style("z-index", "10");

  d3.csv("https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/Grouped_Bar_Chart_Input_v3.csv").then(data => {
    // Exclude the last row if location is 'Global'
    data = data.filter(d => d.location && d.location.toLowerCase() !== "global");

    data.forEach(d => {
      d.country = d.location.trim();
      d.percent_total_cases = +d.percent_total_cases;
      d.percent_total_deaths = +d.percent_total_deaths;
      d.total_cases = +d.total_cases;
      d.total_deaths = +d.total_deaths;
    });

    const keys = ["percent_total_cases", "percent_total_deaths"];

    const margin = { top: 50, right: 30, bottom: 60, left: 120 };
    const width = 900 - margin.left - margin.right;
    const height = 500 - margin.top - margin.bottom;

    const x0 = d3.scaleBand()
      .domain(data.map(d => d.country))
      .range([0, width])
      .paddingInner(0.2);

    const x1 = d3.scaleBand()
      .domain(keys)
      .range([0, x0.bandwidth()])
      .padding(0.05);

    const y = d3.scaleLinear()
      .domain([0, d3.max(data, d => Math.max(d.percent_total_cases, d.percent_total_deaths)) * 1.1])
      .nice()
      .range([height, 0]);

    const color = d3.scaleOrdinal()
      .domain(keys)
      .range(["#1f77b4", "#ff7f0e"]);

    const g = svg.append("g")
      .attr("transform", `translate(${margin.left},${margin.top})`);

    g.append("g")
      .selectAll("g")
      .data(data)
      .join("g")
      .attr("transform", d => `translate(${x0(d.country)},0)`)
      .selectAll("rect")
      .data(d => keys.map(key => ({
        key,
        value: d[key],
        total_cases: d.total_cases,
        total_deaths: d.total_deaths,
        country: d.country
      })))
      .join("rect")
      .attr("x", d => x1(d.key))
      .attr("y", d => y(d.value))
      .attr("width", x1.bandwidth())
      .attr("height", d => height - y(d.value))
      .attr("fill", d => color(d.key))
      .on("mouseover", function(event, d) {
        tooltip.style("visibility", "visible")
          .html(`
            <strong>${d.country}</strong><br>
            ${d.key === "percent_total_cases" ? "% of Global Cases" : "% of Country's Cases Died"}: ${d.value.toFixed(2)}%<br>
            ${d.key === "percent_total_cases" ? "Total Cases: " + d.total_cases.toLocaleString() : "Total Deaths: " + d.total_deaths.toLocaleString()}
          `);
        d3.select(this).attr("opacity", 0.8);
      })
      .on("mousemove", function(event) {
        tooltip.style("left", (event.pageX + 10) + "px")
               .style("top", (event.pageY - 20) + "px");
      })
      .on("mouseout", function() {
        tooltip.style("visibility", "hidden");
        d3.select(this).attr("opacity", 1);
      });

    g.append("g")
      .attr("transform", `translate(0,${height})`)
      .call(d3.axisBottom(x0))
      .selectAll("text")
      .attr("transform", "rotate(-15)")
      .style("text-anchor", "end");

    g.append("g")
      .call(d3.axisLeft(y));

    g.append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -90)
      .attr("x", -height / 2)
      .attr("dy", "1em")
      .style("text-anchor", "middle")
      .style("fill", "#fff")
      .text("Percentage (%)");

    const legend = svg.append("g")
      .attr("font-family", "sans-serif")
      .attr("font-size", 12)
      .attr("text-anchor", "start")
      .selectAll("g")
      .data(keys)
      .join("g")
      .attr("transform", (d, i) => `translate(${margin.left + i * 250},${height + margin.top + 40})`);

    legend.append("rect")
      .attr("width", 18)
      .attr("height", 18)
      .attr("fill", color);

    legend.append("text")
      .attr("x", 24)
      .attr("y", 9)
      .attr("dy", "0.35em")
      .style("fill", "#fff")
      .text(d => d === "percent_total_cases" ? "% of Global Cases" : "% of Country's Cases Died");
  });
}

// Fix: Attach the click handler to load the grouped bar chart on Further Insights
const insightsBtn = document.getElementById("insightsBtn");
if (insightsBtn) {
  insightsBtn.onclick = () => {
    const globe = document.getElementById("globe");
    const barChartContainer = document.getElementById("barChartContainer");
    const backBtn = document.getElementById("backBtn");

    if (globe.style.display !== "none") {
      globe.style.display = "none";
      barChartContainer.style.display = "block";
      backBtn.style.display = "block";
      drawGroupedBarChart();
    } else {
      barChartContainer.style.display = "none";
      document.getElementById("scatterChartContainer").style.display = "block";
      drawScatterChart?.();
    }
  };
}
