d3.json('final_cleaned_water_data.json').then(function(data) {
    
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
        locationSelect.append("option").text(loc).attr("value", loc);
    });

    function createGraph(parameter, parameter2, location) {
        
        d3.select("#my_dataviz").html("");

        
        const parameterData = flattenedData.filter(d => d[parameter] != null && d.locName === location);
        const parameterData2 = flattenedData.filter(d => d[parameter2] != null && d.locName === location);

        
        const margin = {top: 10, right: 20, bottom: 50, left: 60},
              width = 960 - margin.left - margin.right,
              height = 500 - margin.top - margin.bottom;

        
        const svg = d3.select("#my_dataviz")
                      .append("svg")
                      .attr("width", width + margin.left + margin.right)
                      .attr("height", height + margin.top + margin.bottom)
                      .style("background-color", "lightblue")
                      .append("g")
                      .attr("transform", `translate(${margin.left},${margin.top})`);

        
        const x = d3.scaleTime()
                    .domain(d3.extent(flattenedData, function(d) { return d.date; }))
                    .range([0, width]);
        svg.append("g")
           .attr("transform", `translate(0,${height})`)
           .call(d3.axisBottom(x));

        
        svg.append("text")             
           .attr("transform", `translate(${width / 2}, ${height + margin.top + 20})`)
           .style("text-anchor", "middle")
           .text("Date");

        
        const y = d3.scaleLinear()
                    .domain([0, d3.max(flattenedData, function(d) { return Math.max(d[parameter], d[parameter2]); })])
                    .range([height, 0]);
        svg.append("g")
           .call(d3.axisLeft(y));

        
        svg.append("text")
           .attr("transform", "rotate(-90)")
           .attr("y", 0 - margin.left)
           .attr("x",0 - (height / 2))
           .attr("dy", "1em")
           .style("text-anchor", "middle")
           .text("Value");

        
        const line1 = d3.line()
                       .defined(d => d[parameter] != null) 
                       .x(function(d) { return x(d.date); })
                       .y(function(d) { return y(d[parameter]); });

        const line2 = d3.line()
                       .defined(d => d[parameter2] != null) 
                       .x(function(d) { return x(d.date); })
                       .y(function(d) { return y(d[parameter2]); });

        
        svg.append("path")
           .datum(parameterData)
           .attr("fill", "none")
           .attr("stroke", "steelblue")
           .attr("stroke-width", 1.5)
           .attr("d", line1);

        svg.append("path")
           .datum(parameterData2)
           .attr("fill", "none")
           .attr("stroke", "green") 
           .attr("stroke-width", 1.5)
           .attr("d", line2);

        
    d3.select(".tooltip").remove();

    
    const tooltip = d3.select("body").append("div") 
                     .attr("class", "tooltip")       
                     .style("opacity", 0);

    
    svg.selectAll(".dot")
   .data(parameterData)
   .enter().append("circle")
   .attr("class", "dot")
   .attr("cx", function(d) { return x(d.date); })
   .attr("cy", function(d) { return y(d[parameter]); })
   .attr("r", 5)
   .on("mouseover", function(event, d) {
       tooltip.transition()
              .duration(200)
              .style("opacity", .9);
       tooltip.html(`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `TN: ${d.TN}<br/>` +
                `TP: ${d.TP}<br/>` +
                `disNH4: ${d.disNH4}<br/>` +
                `disNO3: ${d.disNO3}<br/>` +
                `disPO4: ${d.disPO4}<br/>` +
                `TDN: ${d.TDN}<br/>` +
                `TDP: ${d.TDP}<br/>` +
                `locName: ${d.locName}<br/>` +
                `Pool Volume (cu ft): ${d['Pool Volume (cu ft)']}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
                `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
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
       tooltip.html(`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `TN: ${d.TN}<br/>` +
                `TP: ${d.TP}<br/>` +
                `disNH4: ${d.disNH4}<br/>` +
                `disNO3: ${d.disNO3}<br/>` +
                `disPO4: ${d.disPO4}<br/>` +
                `TDN: ${d.TDN}<br/>` +
                `TDP: ${d.TDP}<br/>` +
                `locName: ${d.locName}<br/>` +
                `Pool Volume (cu ft): ${d['Pool Volume (cu ft)']}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
                `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");

       
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
          .attr("class", "dataLabel")
          .attr("x", x(d.date))
          .attr("y", y(d[parameter]) - 10) 
          .attr("text-anchor", "middle")
          .attr("fill", "black")
          .text(d[parameter]);
   });

   
    svg.selectAll(".dot2")
       .data(parameterData2)
       .enter().append("circle")
       .attr("class", "dot2")
       .attr("cx", d => x(d.date))
       .attr("cy", d => y(d[parameter2]))
       .attr("r", 5)
       .attr("fill", "green")
       .on("mouseover", function(event, d) {
           tooltip.transition()
                  .duration(200)
                  .style("opacity", .9);
           tooltip.html(`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `TN: ${d.TN}<br/>` +
                `TP: ${d.TP}<br/>` +
                `disNH4: ${d.disNH4}<br/>` +
                `disNO3: ${d.disNO3}<br/>` +
                `disPO4: ${d.disPO4}<br/>` +
                `TDN: ${d.TDN}<br/>` +
                `TDP: ${d.TDP}<br/>` +
                `locName: ${d.locName}<br/>` +
                `Pool Volume (cu ft): ${d['Pool Volume (cu ft)']}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
                `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)

              .style("left", (event.pageX + 5) + "px")
              .style("top", (event.pageY - 28) + "px");
       })
       .on("mouseout", function() {
           tooltip.transition()
                  .duration(500)
                  .style("opacity", 0);
       })
       .on("click", function(event, d) {

           
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
