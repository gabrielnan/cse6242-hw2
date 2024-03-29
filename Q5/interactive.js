var margin = {top: 50, right: 50, bottom: 50, left: 100},
    width = window.innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

svg.append("text")
    .attr("x", width/2)
    .attr("y", -margin.top)
    .attr("text-anchor", "middle")
    .attr("dominant-baseline", "hanging")
    .attr("class", "label-text")
    .text("US Earthquakes by Region 2010-2015");

var parseTime = d3.timeParse("%Y");
function getUnique(dataset, field) {
    return [...new Set(dataset.map(function(d) { return d[field];}))];
}
var dotRadius = 3;
var bigDotRadius = 10;

d3.dsv(",", "state-year-earthquakes.csv", function(d) {
    return {
        state: d.state,
        region: d.region,
        year: d.year,
        count: +d.count
    };
}).then(function(dataset) {
    var regions = getUnique(dataset, 'region');
    var years = getUnique(dataset, 'year').map(d => parseTime(d));
    colors = ["red", "blue", "green", "purple"];

    var perRegion = regions.map(function(region, i) {
        var values = [];
        years.forEach(function(year) {
            var val = d3.sum(
                dataset.filter(d => d.region == region && d.year == year.getFullYear()),
                d => d.count);
            values.push({year: year, value: val, region: region});
        });
        return {region: region, values: values, color: colors[i]};
    });

    var x = d3.scaleTime()
        .domain([
            d3.min(years),
            d3.max(years)
        ])
        .range([0, width]);
    var y = d3.scaleLinear()
        .domain([
            d3.min(perRegion, data => d3.min(data.values, d => d.value)),
            d3.max(perRegion, data => d3.max(data.values, d => d.value)),
        ])
        .range([height, 0]);

    var line = d3.line()
        .x(d => x(d.year))
        .y(d => y(d.value));
        // .curve(d3.curveMonotoneX);

    svg.selectAll(".path")
        .data(perRegion)
        .enter()
        .append("path")
        .attr("class", "line")
        .attr("d", d => line(d.values))
        .attr("stroke", d => d.color);

    svg.selectAll(".dot")
        .data(perRegion)
        .enter()
        .each(function(data) {
            d3.select(this).selectAll(".dot")
                .data(data.values)
                .enter()
                .append("circle")
                .attr("cx", d => x(d.year))
                .attr("cy", d => y(d.value))
                .attr("fill", data.color)
                .style("stroke", "white")
                .style("stroke-width", "1.5")
                .attr("r", dotRadius)
                .on("mouseover", handleMouseOver)
                .on("mouseout", handleMouseOut)
        });

    function handleMouseOver(d) {
        update(d.region, d.year);
        d3.select(this).attr("r", bigDotRadius);
    }
    function handleMouseOut(d) {
        d3.select(this).attr("r", dotRadius);
        deleteBar()
    }

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    svg.append("g")
        .attr("class", "axis")
        .call(d3.axisLeft(y));

    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width - margin.right) + ",10)");

    var legendCircleR = 7;
    var spacing = 5;
    function yLegendPos(d, i) {
        return i * (legendCircleR * 2 + spacing);
    }

    legend.selectAll(".legend-circle")
        .data(perRegion)
        .enter()
        .append("circle")
        .attr("class", "legend-circle")
        .attr("cx", 0)
        .attr("cy", yLegendPos)
        .attr("r", legendCircleR)
        .attr("fill", d => d.color);

    legend.selectAll(".legend-text")
        .data(perRegion)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("x", legendCircleR + 3)
        .attr("y", yLegendPos)
        .attr("alignment-baseline", "middle")
        .text(d => d.region);


    //========================================================================
    //========================================================================


    var yBar = d3.scaleBand()
        .range([height, 0]);

    var xBar = d3.scaleLinear()
        .range([0, width]);
    var svgBar = d3.select("body").append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    function update(region, year) {
        var filtered = dataset.filter(
            d => d.region == region && d.year == year.getFullYear()
        );
        filtered.sort(function(x, y) {
            var diff = x.count - y.count;
            if (diff != 0) {
                return diff
            }
            return d3.ascending(x.state, y.state);
        });
        var states = getUnique(filtered, "state");
        var padding = "0.08";

        xBar.domain([
            0,
            d3.max(filtered, d => d.count)
        ]);
        yBar.domain(states)
            .paddingInner(padding)
            .paddingOuter(padding);

        // svgBar.selectAll("text").remove();
        svgBar.selectAll(".axis").remove();
        svgBar.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(xBar));

        svgBar.append("g")
            .attr("class", "axis")
            .call(d3.axisLeft(yBar));

        svgBar.selectAll(".bar").remove()
        svgBar.selectAll(".bar")
            .data(filtered)
            .enter()
            .append("rect")
            .attr("class", "bar")
            .attr("width", d => xBar(d.count))
            .attr("height", yBar.bandwidth())
            .attr("x", 0)
            .attr("y", d => yBar(d.state));

        svgBar.selectAll("#title").remove();
        svgBar.append("text")
            .attr("id", "title")
            .attr("x", width/2)
            .attr("y", -margin.top)
            .attr("text-anchor", "middle")
            .attr("dominant-baseline", "hanging")
            .attr("class", "label-text")
            .text(region + "ern Region Earthquakes " + year.getFullYear());
    }
    function deleteBar() {
        svgBar.selectAll(".axis,.bar,#title").remove()
    }
});