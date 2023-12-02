function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0'); 
    return `${year}-${month}-${day}`;
}


d3.json('modified_soil_data.json').then(function(data) 
{
    
    let flattenedData = data.reduce((acc, d) => {
        const date = d3.isoParse(d.date);
        d.records.forEach(record => {
            acc.push({date, ...record});
        });
        return acc;
    }, []);

    
    let minDate = d3.min(flattenedData, d => d.date);
    let maxDate = d3.max(flattenedData, d => d.date);

    
    let startDate = minDate;
    let endDate = maxDate;

    
    d3.select("#start-date-slider")
        .attr("min", minDate.getTime())
        .attr("max", maxDate.getTime())
        .attr("value", minDate.getTime())
        .on("input", function() {
            startDate = new Date(+this.value);
            updateGraph();
            updateSelectedDateLabels(startDate, endDate); 
        });

    d3.select("#end-date-slider")
        .attr("min", minDate.getTime())
        .attr("max", maxDate.getTime())
        .attr("value", maxDate.getTime())
        .on("input", function() {
            endDate = new Date(+this.value);
            updateGraph();
            updateSelectedDateLabels(startDate, endDate); 
        });

    
    function updateSelectedDateLabels(startDate, endDate) {
        d3.select("#start-date-label")
            .text("Start Date: " + formatDate(startDate)); 
        
        d3.select("#end-date-label")
            .text("End Date: " + formatDate(endDate)); 
    }

    
    d3.select("#btn-1y").on("click", () => setRange(1, 'year'));
    d3.select("#btn-2y").on("click", () => setRange(2, 'year'));
    d3.select("#btn-all").on("click", () => setRange(null));

    function setRange(duration, unit) {
        endDate = new Date();

        if (duration && unit === 'year') {
            startDate = d3.timeYear.offset(endDate, -duration);
        } else {
            startDate = minDate;
            endDate = maxDate;
        }

        updateSliders();
        updateGraph();
    }

    function updateSliders() {
        d3.select("#start-date-slider").property("value", startDate.getTime());
        d3.select("#end-date-slider").property("value", endDate.getTime());
    }

    
    let margin = {top: 30, right: 20, bottom: 30, left: 50},
        width = 960 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    
    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);

    
    let xAxis = d3.axisBottom(x).ticks(5);
    let yAxis = d3.axisLeft(y).ticks(5);

    
    let svg = d3.select("#scatter-plot")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", "orange")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
    d3.select(".tooltip").remove();

    
    const tooltip = d3.select("body").append("div") 
                     .attr("class", "tooltip")       
                     .style("opacity", 0);

    
    function updateGraph() {
    let selectedParam = d3.select("#parameter-select").property("value");

    
    let filteredData = flattenedData
        .filter(d => d.date >= startDate && d.date <= endDate)
        .map(d => ({ date: d.date, value: d[selectedParam], ...d })); 

    
    svg.selectAll("*").remove();

    
    x.domain([startDate, endDate]);
    y.domain([0, d3.max(filteredData, d => d.value)]);

    
    svg.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 5.5)
        .style("fill", "darkblue") 
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `dateAnalTPTN: ${d.dateAnalTPTN}<br/>` +
                `TN: ${d.TN}<br/>` +
                `TP: ${d.TP}<br/>` +
                `SPSC: ${d.SPSC}<br/>` +
                `pH: ${d.pH}<br/>` +
                `EC: ${d.EC}<br/>` +
                `locName: ${d.locName}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
                `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
                .style("left", (event.pageX + 5) + "px")
                .style("top", (event.pageY - 28) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })
        .on("click", function (event, d) {
            
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            
            tooltip.html(`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                `dateAnalTPTN: ${d.dateAnalTPTN}<br/>` +
                `TN: ${d.TN}<br/>` +
                `TP: ${d.TP}<br/>` +
                `SPSC: ${d.SPSC}<br/>` +
                `pH: ${d.pH}<br/>` +
                `EC: ${d.EC}<br/>` +
                `locName: ${d.locName}<br/>` +
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
                .attr("y1", y(d.value))
                .attr("x2", x(d.date))
                .attr("y2", height)
                .attr("stroke", "black")
                .attr("stroke-width", 1)
                .attr("stroke-dasharray", "5,5");

            
            svg.append("text")
                .attr("class", "dataLabel")
                .attr("x", x(d.date))
                .attr("y", y(d.value) - 10) 
                .attr("text-anchor", "middle")
                .attr("fill", "black")
                .text(d.value);
        });

    
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    
    svg.append("g")
        .call(yAxis);
}


d3.select("#parameter-select").on("change", updateGraph);


updateGraph();
});
