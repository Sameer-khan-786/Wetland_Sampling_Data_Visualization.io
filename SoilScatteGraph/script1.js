d3.json('final_cleaned_soil_data.json').then(function(data) {
    
    const flattenedData = data.reduce((acc, d) => {
        const date = d3.isoParse(d.date);
        d.records.forEach(record => {
            acc.push({date, ...record});
        });
        return acc;
    }, []);

     
    const uniqueLocations = [...new Set(flattenedData.map(item => item.locName))];

    
    const locationSelect = d3.select("#location-select");
    uniqueLocations.forEach(loc => {
        locationSelect.append("option")
            .text(loc)
            .attr("value", loc)
           

    });

    function createGraph(parameter, parameter2, location) {


        parameterSelect = d3.select("#parameter-select");
           

        parameter2Select = d3.select("#parameter2-select");
       
        
        d3.select("#my_dataviz").html("");

        
        const parameterData = flattenedData.filter(d => d[parameter] != null && d.locName === location);
        const parameterData2 = flattenedData.filter(d => d[parameter2] != null && d.locName === location);

        
        const margin = {top: 10, right: 60, bottom: 40, left: 60},
              width = 1450 - margin.left - margin.right,
              height = 520 - margin.top - margin.bottom;

        
        const svg = d3.select("#my_dataviz")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .style("background-color", "rgb(255, 250, 240)")
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

        
        const x = d3.scaleTime()
                    .domain(d3.extent(flattenedData, function(d) { return d.date; }))
                    .range([0, width]);
        svg.append("g")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x));

        
        svg.append("text")             
           .attr("transform", `translate(${width / 2}, ${height + margin.top + 25})`)
           .style("text-anchor", "middle")
           .text("Date")
           .style("fill", "black")
           .style("font-size", "24px")
           .style("font-weight", "bold");

        
        const y = d3.scaleLinear()
                    .domain([0, d3.max(flattenedData, function(d) { return Math.max(d[parameter], d[parameter2]); })])
                    .range([height, 0]);
        svg.append("g")
           .call(d3.axisLeft(y));


           //creating second scale for second y axis 
        const y2 = d3.scaleLinear()
        .domain([0, d3.max(flattenedData, function(d) { return d[parameter2]; })])
                .range([height, 0]);

    // Append the second y-axis to the right
    svg.append("g")
       .attr("transform", `translate(${width}, 0)`)
       .call(d3.axisRight(y2));

        
        svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 0 - margin.left - 5)
           .attr("x",0 - (height / 2))
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .text(`${parameter}`)
           .style("fill", "#4A148C")
           .style("font-size", "24px")
           .style("font-weight", "bold");

        svg.append("text") 
           .attr("transform", "rotate(-90)")
           .attr("y", width - margin.right + 95)
           .attr("x",0 - (height / 2))
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .text(`${parameter2}`)
           .style("fill", "#00C853")
           .style("font-size", "24px")
           .style("font-weight", "bold");

        
        const line1 = d3.line()
                       .defined(d => d[parameter] != null) 
                       .x(function(d) { return x(d.date); })
                       .y(function(d) { return y(d[parameter]); });

        const line2 = d3.line()
                       .defined(d => d[parameter2] != null) 
                       .x(function(d) { return x(d.date); })
                       .y(function(d) { return y2(d[parameter2]); });

        
        svg.append("path")
           .datum(parameterData)
           .attr("fill", "none")
           .attr("stroke", "#4A148C")
           .attr("stroke-width", 10)
           .attr("stroke-opacity", 0.8)
           .attr("d", line1);

        svg.append("path")
           .datum(parameterData2)
           .attr("fill", "none")
           .attr("stroke", "#00C853") 
           .attr("stroke-width", 10)
           .attr("stroke-opacity", 0.8)
           .attr("d", line2);

        
    d3.select(".tooltip").remove();

    
    const tooltip = d3.select("body").append("div") 
               .attr("class", "tooltip")
               .style("position", "absolute")
               .style("background-color", "white")
               .style("border", "1px solid black")
               .style("padding", "5px")
               .style("opacity", 0);
       
       
               function getTooltipLeftPosition(mouseX) {
                   const tooltipWidth = parseFloat(tooltip.style("width"));
                   const windowWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;
                   const leftPosition = mouseX + tooltipWidth + 10 > windowWidth
                       ? windowWidth - tooltipWidth - 10  // Adjusted this line
                       : mouseX + 10;
                   return leftPosition;
               }
               
               function getTooltipTopPosition(mouseY) {
                   const tooltipHeight = parseFloat(tooltip.style("height"));
                   const windowHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;
                   const topPosition = mouseY + tooltipHeight + 10 > windowHeight
                       ? windowHeight - tooltipHeight - 10  // Adjusted this line
                       : mouseY + 10;
                   return topPosition;
               }


            selectedParameter = parameter;
            selectedParameter2 = parameter2;

    
    svg.selectAll(".dot")
   .data(parameterData)
   .enter().append("circle")
   .attr("class", "dot")
   .attr("cx", function(d) { return x(d.date); })
   .attr("cy", function(d) { return y(d[parameter]); })
   .attr("r", 10)
   .attr("fill", "#4A148C")
   .attr("stroke", "white")
   .attr("stroke-width", 1)
   .attr("stroke-opacity", 1)
   .style("stroke-linejoin", "round")
   .style("stroke-linecap", "round")
   .on("mouseover", function(event, d) {
       tooltip.transition()
              .duration(200)
              .style("opacity", .9);
              tooltip.html(
                `${selectedParameter}: ${d[selectedParameter]}<br/>`
                )
                .style("left", getTooltipLeftPosition(event.pageX) + "px")
                .style("top", getTooltipTopPosition(event.pageY) + "px");
        })
       
       .on("mouseout", function(d) {
       tooltip.transition()
              .duration(500)
              .style("opacity", 0);
   })
   .on("click", function(event, d) {
       
       tooltip.transition()
              .duration(200)
              .style("opacity", .9);
       tooltip.html(
                `${selectedParameter}: ${d[selectedParameter]}<br/>` +
                //`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `dateAnalTPTN: ${d.dateAnalTPTN}<br/>` +
                //`TN: ${d.TN}<br/>` +
                //`TP: ${d.TP}<br/>` +
                //`SPSC: ${d.SPSC}<br/>` +
                //`pH: ${d.pH}<br/>` +
                //`EC: ${d.EC}<br/>` +
                `locName: ${d.locName}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
               // `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
                .style("left", getTooltipLeftPosition(event.pageX) + "px")
                .style("top", getTooltipTopPosition(event.pageY) + "px");

       /*
       svg.selectAll(".verticalLine, .dataLabel").remove();

       
       svg.append("line")
          .attr("class", "verticalLine")
          .attr("x1", x(d.date))
          .attr("y1", y(d[parameter]))
          .attr("x2", x(d.date))
          .attr("y2", height)
          .attr("stroke", "black")
          .attr("stroke-width", 1)
          .attr("stroke-dasharray", "5,5");

       
       svg.append("text")
          .attr("class", "yaxislabel")
          .attr("x", x(d.date))
          .attr("y", y(d[parameter]) - 10) 
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .text(`${selectedParameter}`);
          */
   });

   
    svg.selectAll(".dot2")
       .data(parameterData2)
       .enter().append("circle")
       .attr("class", "dot2")
       .attr("cx", d => x(d.date))
       .attr("cy", d => y2(d[parameter2]))
       .attr("r", 10)
        .attr("fill", "#00C853")
        .attr("stroke", "white")
        .attr("stroke-width", 1)
        .attr("stroke-opacity", 1)
        .style("stroke-linejoin", "round")
        .style("stroke-linecap", "round")
       .on("mouseover", function(event, d) {
           tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
                  tooltip.html(
                    `${selectedParameter2}: ${d[selectedParameter2]}<br/>` 
                   )

                   .style("left", getTooltipLeftPosition(event.pageX) + "px")
                   .style("top", getTooltipTopPosition(event.pageY) + "px");
          })
       .on("mouseout", function() {
           tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
       })
       .on("click", function(event, d) {
        tooltip.transition()
               .duration(200)
               .style("opacity", .9);
        tooltip.html(
                `${selectedParameter2}: ${d[selectedParameter2]}<br/>` +
                //`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `dateAnalTPTN: ${d.dateAnalTPTN}<br/>` +
                //`TN: ${d.TN}<br/>` +
                //`TP: ${d.TP}<br/>` +
                //`SPSC: ${d.SPSC}<br/>` +
                //`pH: ${d.pH}<br/>` +
                //`EC: ${d.EC}<br/>` +
                `locName: ${d.locName}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
               // `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
                .style("left", getTooltipLeftPosition(event.pageX) + "px")
                .style("top", getTooltipTopPosition(event.pageY) + "px");

           /*
           svg.selectAll(".verticalLine, .dataLabel").remove();

           
           svg.append("line")
              .attr("class", "verticalLine")
              .attr("x1", x(d.date))
              .attr("y1", y(d[parameter2]))
              .attr("x2", x(d.date))
              .attr("y2", height)
              .attr("stroke", "green")
              .attr("stroke-width", 1)
              .attr("stroke-dasharray", "5,5");

           
           svg.append("text")
              .attr("class", "dataLabel")
              .attr("x", x(d.date))
              .attr("y", y(d[parameter2]) - 10)
              .attr("text-anchor", "middle")
              .attr("fill", "green")
              .text(d[parameter2]);
*/

       });
    }

    
    d3.select("#parameter-select").on("change", function() {
        const selectedParameter = this.value;
        const selectedParameter2 = d3.select("#parameter2-select").node().value;
        const selectedLocation = d3.select("#location-select").node().value;
        createGraph(selectedParameter, selectedParameter2, selectedLocation);
    });

    d3.select("#parameter2-select").on("change", function() {
        const selectedParameter = d3.select("#parameter-select").node().value;
        const selectedParameter2 = this.value;
        const selectedLocation = d3.select("#location-select").node().value;
        createGraph(selectedParameter, selectedParameter2, selectedLocation);
    });

    d3.select("#location-select").on("change", function() {
        const selectedLocation = this.value;
        const selectedParameter = d3.select("#parameter-select").node().value;
        const selectedParameter2 = d3.select("#parameter2-select").node().value;
        createGraph(selectedParameter, selectedParameter2, selectedLocation);
    });

    
    createGraph('TN', 'TP', uniqueLocations[0]);
});
