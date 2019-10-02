var margin = {top: 50, right: 80, bottom: 80, left: 80}
    , width = 960 - margin.left - margin.right
    , height = 500 - margin.top - margin.bottom;
var dataset;
var parseTime = d3.timeParse("%Y");
var colors = {
    '5_5.9': '#FFC300',
    '6_6.9': '#FF5733',
    '7_7.9': '#C70039',
    '8.0+': '#900C3F'};
var fields = Object.keys(colors);

dataset = d3.dsv(",", "earthquakes.csv", function(d) {
    var obj = {year: parseTime(d.year)};
    fields.forEach(function(field) {
        obj[field] = +d[field]
    });
    obj.estimated_deaths = +d["Estimated Deaths"];
    return obj;
}).then(function(dataset) {
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

    var yScale = d3.scaleLinear()
        .domain([
            d3.min(dataset, function(d) {return d["8.0+"]}),
            d3.max(dataset, function(d) {return d["5_5.9"]})
        ])
        .range([height, 0]);

    var svg = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    var xAxis = d3.axisBottom()
        .scale(xScale);  // todo: change ticks and tickformat

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(yScale)); // todo: check if need to add ticks

    var line = d3.line()
        .x(function(d) { return xScale(d.year); })
        .y(function(d) { return yScale(d.value); })
        .curve(d3.curveMonotoneX); // todo: what is that?

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
        .attr("x", width - 60)
        .attr("y", function(d, i) { return legendScale(i); })
        .style("fill", function(d) { return d.color; });

    svg.selectAll(".text")
        .data(magnitudes)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("dominant-baseline", "hanging")
        .attr("x", width - 30)
        .attr("y", function(d, i) { return legendScale(i); })
        .text(function(d) {console.log(d.magnitude); return d.magnitude; });

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
        .text("Worldwide Earthquake stats 2000-2015");

    svg.append("circle")
        .attr("r", 2)
        .attr("cx", width/2)
        .attr("cy", 0)
        .attr("fill", "red")

});

