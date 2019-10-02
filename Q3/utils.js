function base_chart(dataset, title, postYScale, preYScale, yMin) {
    postYScale = postYScale || d3.scaleLinear();
    preYScale = preYScale || function(val) { return val; };
    yMin = yMin || 0;

    var magnitudes = Object.keys(colors).map(function(magnitude) {
        return {
            magnitude: magnitude,
            color: colors[magnitude],
            values: dataset.map(function(d) {
                return {year: d.year, value: d[magnitude]}
            }),
            estimated_deaths: dataset.map(function(d) {
                return d.estimated_deaths;
            })
        };
    });

    var xScale = d3.scaleTime()
        .domain([
            d3.min(dataset, function(d) { return d.year;}),
            d3.max(dataset, function(d) { return d.year;})
        ])
        .range([0, width]);

    postYScale.domain([
            Math.max(d3.min(dataset, function(d) {return d["8.0+"]}), yMin),
            d3.max(dataset, function(d) {return d["5_5.9"]})
        ])
        .range([height, 0]);

    function yScale(val) {
        return postYScale(preYScale(val));
    }

    var svg = d3.select("body").append("svg")
        .attr("class", "svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.axisBottom()
        .scale(xScale);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(postYScale));

    var line = d3.line()
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.value); })
        .curve(d3.curveMonotoneX);

    svg.selectAll(".path")
        .data(magnitudes)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", function(d) { return line(d.values); })
        .attr("stroke", function(d) { return d.color; });

    legendScale = d3.scaleLinear()
        .domain([0, 3])
        .range([0, 90]);

    svg.selectAll(".rect")
        .data(magnitudes)
        .enter()
        .append("rect")
        .attr("class", "legend-rect")
        .attr("x", width + 10)
        .attr("y", function(d, i) { return legendScale(i); })
        .style("fill", function(d) { return d.color; });

    svg.selectAll(".text")
        .data(magnitudes)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("dominant-baseline", "hanging")
        .attr("x", width + 40)
        .attr("y", function(d, i) { return legendScale(i); })
        .text(function(d) { return d.magnitude; });

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.top)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "ideographic")
        .attr("class", "label-text")
        .text("Year");

    svg.append("text")
        .attr("class", "label-text")
        .attr("transform", "rotate(-90)")
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle")
        .attr("y", -margin.left)
        .attr("x", -(height / 2))
        .attr("text-anchor", "middle")
        .text("Num of Earthquakes");

    svg.append("text")
        .attr("x", width/2)
        .attr("y", -margin.top)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("class", "label-text")
        .text(title);
    return {svg: svg, xScale: xScale, yScale: yScale}
}

function threshold_fn(threshold) {
    return function(val) {
        if (val < threshold) {
            return threshold;
        }
        return val;
    };
}

function add_circles(dataset, svg, xScale, yScale) {
    radiusScale = d3.scaleLinear()
        .domain([
            d3.min(dataset, function(d) { return d.estimated_deaths;}),
            d3.max(dataset, function(d) { return d.estimated_deaths;})
        ])
        .range([4, 13]);

    var sel = svg.selectAll(".dot")
        .data(dataset)
        .enter();
    Object.keys(colors).forEach(function(magnitude) {
        sel.append("circle")
            .attr("cx", function(d) { return xScale(d.year); })
            .attr("cy", function(d) { return yScale(d[magnitude]); })
            .attr("fill", colors[magnitude])
            .attr("r", function(d) { return radiusScale(d.estimated_deaths);});
    });

}
function pagebreak() {
    d3.select("body")
        .append("div")
        .attr("class", "pagebreak")
}

