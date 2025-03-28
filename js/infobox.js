function updateInfoBox() {
    const globe = document.getElementById("globe");
    const barChart = document.getElementById("barChartContainer");
    const lineChart = document.getElementById("lineChartContainer");
    const scatterChart = document.getElementById("scatterChartContainer");
    const infoBox = document.getElementById("infoBox");

    if (!infoBox) {
        console.warn("Error: infoBox not found in HTML!");
        return;
    }

    if (globe && globe.style.display !== "none") {
        
        infoBox.innerHTML = `
           <div class="info-box info-left">
              <h2>A Crisis That Knew No Borders</h2>
              <p>In just a few months, COVID-19 reshaped our world. No country was untouched, and the virus spread at an unprecedented pace. But how did different regions handle the crisis?.</p>
              <p><b>What This Interactive Globe Shows: </b>Countries are color-coded based on total COVID-19 cases.
Darker shades indicate regions that were hit hardest.</p>
              <p>This isn't just a map—it's a window into history.
How did your country fare? What policies helped or failed?

Click on a country to uncover its COVID-19 story.</p>
           </div>
        `;
        infoBox.style.display = "block";

    } else if (barChart && barChart.style.display !== "none" ){
        // Graph Pages Info (Right Side)
        infoBox.innerHTML = `
           <div class="info-box info-right">
              <h2>How Hard Did Different Countries Get Hit?</h2>
              <p> COVID-19 affected nations in starkly different ways. While some managed to control infections, others saw millions of cases and devastating fatalities.</p>
              <p><b>How to Read:</b> Blue bars indicate % of total cases in the world, orange represents % of deaths from those cases.</p>
              <p><b>insights</b> Some highly infected nations managed to keep fatalities low. Others with fewer cases saw disproportionately high death rates.
              The pandemic was not just about cases—it was about how well countries responded.</p>
           </div>
        `;
        infoBox.style.display = "block";

    }  else if (scatterChart && scatterChart.style.display !== "none" ){
        // Graph Pages Info (Right Side)
        infoBox.innerHTML = `
           <div class="info-box info-right">
              <h2>📊  The Lockdown Dilemma !!!</h2>
              <p>🔎 <b>As the pandemic spread, governments worldwide enforced lockdowns, restrictions, and policies to slow infections. But did stricter policies actually save lives?</b> into COVID-19 trends, including case numbers, fatalities, and government responses.</p>
              <p>🔎 <b> What This Graph Tells Us:</b> This scatter plot explores the relationship between government response stringency (x-axis) and COVID-19 deaths per million people (y-axis) over time.</p>
              <p>💡<b>Low Stringency, High Deaths?</b> Some points on the right side of the chart show countries that had lax restrictions but experienced high deaths per million.No Clear Pattern? The scattered distribution suggests stringency alone was not the only factor in preventing deaths.
Other factors like healthcare capacity, testing, and vaccination rates also played major roles.</p>
           </div>
        `;
        


        infoBox.style.display = "block";
    } 
    else if (lineChart && lineChart.style.display !== "none" ){
        // Graph Pages Info (Right Side)
        infoBox.innerHTML = `
           <div class="info-box info-right">
              <h2>Lockdowns vs. Cases: Did Stricter Policies Really Work?"</h2>
              <p>When COVID-19 spread across the world, countries took drastic measures—lockdowns, travel bans, and social distancing rules. But was stricter always better?.</p>
              <p><b>  What This Chart Reveals:</b> The blue line shows how COVID-19 cases evolved over time.The orange line represents the Stringency Index—how strict a country’s lockdown policies were.
             By comparing both, we can see if tighter restrictions led to fewer infections—or if cases surged despite them.</p>
              <p><b> Key Insights:</b> Policies alone weren’t enough—testing, public behavior, and healthcare readiness played huge roles.</p>
           </div>
        `;
        


        infoBox.style.display = "block";
    } else {
        // Hide the info box on other pages
        infoBox.style.display = "none";
    }
}

// Ensure the function updates when switching views
document.getElementById("insightsBtn").addEventListener("click", updateInfoBox);
document.getElementById("backBtn").addEventListener("click", updateInfoBox);



