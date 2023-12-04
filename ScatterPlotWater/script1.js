function formatDate(date) {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); 
    const day = String(date.getDate()).padStart(2, '0'); 
    return `${year}-${month}-${day}`;
}


d3.json('modified_water_data.json').then(function(data) 
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

     


    let margin = {top: 50, right: 20, bottom: 25, left: 40},
        width = 640 - margin.left - margin.right,
        height = 370 - margin.top - margin.bottom;

    
    let x = d3.scaleTime().range([0, width]);
    let y = d3.scaleLinear().range([height, 0]);
    
    
    let xAxis = d3.axisBottom(x).ticks(5);
    let yAxis = d3.axisLeft(y).ticks(5);

    
    let svg = d3.select("#scatter-plot")
        .append("svg")
            .attr("width", width + margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            .style("background-color", "rgb(230, 240, 240)")
        .append("g")
            .attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    
    
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

    
    function updateGraph() {
    let selectedParam = d3.select("#parameter-select").property("value");

    
    let filteredData = flattenedData
        .filter(d => d.date >= startDate && d.date <= endDate)
        .map(d => ({ date: d.date, value: d[selectedParam], ...d })); 

    
    svg.selectAll("*").remove();

    
    x.domain([startDate, endDate]);
    y.domain([d3.min(filteredData, d => d.value), d3.max(filteredData, d => d.value)]);

    svg.append("g")
        .attr("class", "y-axis")
        .call(yAxis);
    
    svg.selectAll(".dot")
        .data(filteredData)
        .enter().append("circle")
        .attr("class", "dot")
        .attr("cx", d => x(d.date))
        .attr("cy", d => y(d.value))
        .attr("r", 7)
        .style("fill", "white")
        .style("stroke", "darkblue")
        .style("opacity", "0.9")
        .style("stroke-width", "2.5") 

        
        .on("mouseover", function (event, d) {
            tooltip.transition()
                .duration(200)
                .style("opacity", .9);
            tooltip.html(
                `${selectedParam}: ${d.value}<br/>`
                /* +
                //`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
               // `TN: ${d.TN}<br/>` +
               // `TP: ${d.TP}<br/>` +
               // `disNH4: ${d.disNH4}<br/>` +
               // `disNO3: ${d.disNO3}<br/>` +
               // `disPO4: ${d.disPO4}<br/>` +
               // `TDN: ${d.TDN}<br/>` +
               // `TDP: ${d.TDP}<br/>` +
                `locName: ${d.locName}<br/>` +
                `Pool Volume (cu ft): ${d['Pool Volume (cu ft)']}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
               // `samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}` */
                )
                .style("left", getTooltipLeftPosition(event.pageX) + "px")
                .style("top", getTooltipTopPosition(event.pageY) + "px");
        })
        .on("mouseout", function (d) {
            tooltip.transition()
                .duration(500)
                .style("opacity", 0);
        })

        
        .on("click", function (event, d) {
            
            tooltip.transition()
                .duration(200)
                .style("opacity", 0.95);
            
            tooltip.html(
                `${selectedParam}: ${d.value}<br/>` +
                //`sampleMedia: ${d.sampleMedia}<br/>` +
                `visitDate: ${d.visitDate}<br/>` +
                //`TN: ${d.TN}<br/>` +
                //`TP: ${d.TP}<br/>` +
                //`disNH4: ${d.disNH4}<br/>` +
                //`disNO3: ${d.disNO3}<br/>` +
                //`disPO4: ${d.disPO4}<br/>` +
                //`TDN: ${d.TDN}<br/>` +
                //`TDP: ${d.TDP}<br/>` +
                `locName: ${d.locName}<br/>` +
                `Pool Volume (cu ft): ${d['Pool Volume (cu ft)']}<br/>` +
                `specific_location: ${d.specific_location}<br/>` +
                //`samp_type: ${d.samp_type}<br/>` +
                `notes: ${d.notes}<br/>` +
                `samp_notes: ${d.samp_notes}`)
                .style("left", getTooltipLeftPosition(event.pageX) + "px")
                .style("top", getTooltipTopPosition(event.pageY) + "px");

            /*
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
                */
        });

    svg.select(".y-axis")
        .transition()
        .duration(500)
        .call(yAxis);
        
    svg.append("g")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    
    
}

const parameterSelect = d3.select("#parameter-select");
parameterSelect.style("font-size", "14px");


 d3.select("#parameter-select").on("change", updateGraph)



updateGraph();
});
