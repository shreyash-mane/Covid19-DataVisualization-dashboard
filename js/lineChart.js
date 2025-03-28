function drawLineChart(countryName) {
    const svg = d3.select("#lineChart");
    svg.selectAll("*").remove();
  
    document.getElementById("insightsBtn").style.display = "none";
  
    updateInfoBox();
    // Enhanced tooltip styling
    // const tooltip = d3.select("body")
    //   .append("div")
    //   .attr("class", "chart-tooltip")
    //   .style("position", "absolute")
    //   .style("visibility", "hidden")
    //   .style("background", "rgba(0,0,0,0.8)")
    //   .style("color", "white")
    //   .style("padding", "10px")
    //   .style("border-radius", "5px")
    //   .style("font-size", "14px")
    //   .style("pointer-events", "none")
    //   .style("z-index", "10");
  
  let tooltip = d3.select(".chart-tooltip");
  if (tooltip.empty()) {
    tooltip = d3.select("body")
      .append("div")
      .attr("class", "chart-tooltip")
      .style("position", "absolute")
      .style("visibility", "hidden")
      .style("background", "rgba(0,0,0,0.8)")
      .style("color", "white")
      .style("padding", "10px")
      .style("border-radius", "5px")
      .style("font-size", "14px")
      .style("pointer-events", "none")
      .style("z-index", "10");
  }
  
    d3.csv("https://raw.githubusercontent.com/JeeveshJoshi/Resources/refs/heads/main/LineChart.csv")
      .then(data => {
        // Filter and process data
        const countryData = data
          .filter(d => d.location && d.location.trim() === countryName.trim() && 
                 d.stringency_index && d.new_cases_smoothed_per_million)
          .map(d => ({
            date: new Date(d.date),
            location: d.location,
            stringency_index: +d.stringency_index,
            new_cases_smoothed_per_million: +d.new_cases_smoothed_per_million
          }))
          .sort((a, b) => a.date - b.date);
  
        // Set up chart dimensions
        const margin = { top: 50, right: 90, bottom: 50, left: 70 };
        const width = 1200 - margin.left - margin.right;
        const height = 500 - margin.top - margin.bottom;
  
        const g = svg.append("g").attr("transform", `translate(${margin.left},${margin.top})`);
  
        // Set x-axis domain to start from 2019
        const minDate = new Date("2019-01-01");
        const maxDate = d3.max(countryData, d => d.date);
        const x = d3.scaleTime()
          .domain([minDate, maxDate])
          .range([0, width]);
  
        // Y scales
        const yLeft = d3.scaleLinear()
          .domain([0, d3.max(countryData, d => d.stringency_index) * 1.1])
          .nice()
          .range([height, 0]);
  
        const yRight = d3.scaleLinear()
          .domain([0, d3.max(countryData, d => d.new_cases_smoothed_per_million) * 1.1])
          .nice()
          .range([height, 0]);
  
        // Add axes with improved formatting
        g.append("g")
          .attr("transform", `translate(0,${height})`)
          .call(d3.axisBottom(x)
            .ticks(d3.timeYear.every(1))
            .tickFormat(d3.timeFormat("%Y")));
  
        // Left axis (Stringency Index)
        g.append("g")
          .call(d3.axisLeft(yLeft))
          .append("text")
          .attr("class", "axis-label")
          .attr("transform", "rotate(-90)")
          .attr("y", -margin.left + 15)
          .attr("x", -height / 2)
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("fill", "#ff5252")
          .text("Stringency Index");
  
        // // Right axis (Cases per Million)
        const rightAxis = g.append("g")
          .attr("transform", `translate(${width},0)`)
          .call(d3.axisRight(yRight));
  
        // Add Cases per Million label
        rightAxis.append("text")
          .attr("class", "axis-right-label")
          .attr("transform", "rotate(-90)")
          .attr("y", 40)
          .attr("x", -height / 2)
          .attr("dy", "1em")
          .style("text-anchor", "middle")
          .style("fill", "#ff5252").style("font-size", "15px")
          .text("Cases per Million");
  
        // Line generators
        const lineStringency = d3.line()
          .x(d => x(d.date))
          .y(d => yLeft(d.stringency_index));
  
        const lineCases = d3.line()
          .x(d => x(d.date))
          .y(d => yRight(d.new_cases_smoothed_per_million));
  
        // Add paths
        g.append("path")
          .datum(countryData)
          .attr("fill", "none")
          .attr("stroke", "#ff5252")
          .attr("stroke-width", 3)
          .attr("d", lineStringency);
  
        g.append("path")
          .datum(countryData)
          .attr("fill", "none")
          .attr("stroke", "#00bcd4")
          .attr("stroke-width", 3)
          .attr("d", lineCases);
  
        // Add interactive circles
        g.selectAll(".dot")
          .data(countryData)
          .enter()
          .append("circle")
          .attr("class", "dot")
          .attr("cx", d => x(d.date))
          .attr("cy", d => (yLeft(d.stringency_index) + yRight(d.new_cases_smoothed_per_million)) / 2)
          .attr("r", 5)
          .attr("fill", "transparent")
          .style("opacity", 0.7)
          .on("mouseover", (event, d) => {
    const tooltipEl = document.querySelector(".chart-tooltip");
    if (tooltipEl) {
      tooltipEl.style.visibility = "visible";
      tooltipEl.innerHTML = `
        <div style="font-weight:bold">${d.location}</div>
        <div>Date: ${d3.timeFormat("%b %d, %Y")(d.date)}</div>
        <div style="color:#ff5252">Stringency: ${d.stringency_index.toFixed(1)}</div>
        <div style="color:#00bcd4">Cases/M: ${d.new_cases_smoothed_per_million.toFixed(1)}</div>
      `;
      tooltipEl.style.position = "absolute";
      tooltipEl.style.left = `${event.pageX + 15}px`;
      tooltipEl.style.top = `${event.pageY - 15}px`;
    }
  
    d3.select(event.currentTarget)
      .raise()
      .transition().duration(100)
      .attr("r", 8)
      .attr("fill", "#ffcc00");
  })
  .on("mouseout", (event, d) => {
    const tooltipEl = document.querySelector(".chart-tooltip");
    if (tooltipEl) tooltipEl.style.visibility = "hidden";
  
    d3.select(event.currentTarget)
      .transition().duration(100)
      .attr("r", 5)
      .attr("fill", "transparent");
  });
  
        // Add chart title
        svg.append("text")
          .attr("x", width / 2 + margin.left)
          .attr("y", 30)
          .attr("text-anchor", "middle")
          .style("font-size", "18px")
          .style("fill", "#fff")
          .text(`COVID-19 in ${countryName}`);
  
        // Add x-axis label
        g.append("text")
          .attr("x", width / 2)
          .attr("y", height + 40)
          .style("text-anchor", "middle")
          .style("fill", "#fff")
          .text("Year");
      })
      .catch(error => console.error("Error loading data:", error));
  }