var margin = {top: 30, right: 90, bottom: 200, left: 50},
    width = window.innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var radius = 3;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var years = ["2010", "2011", "2012", "2013", "2014", "2015"];
var colors = [
    "#fff7ec",
    "#fee8c8",
    "#fdd49e",
    "#fdbb84",
    "#fc8d59",
    "#ef6548",
    "#d7301f",
    "#b30000",
    "#7f0000"];
var padding = "0.1";

d3.dsv(",", "earthquakes.csv", function(d) {
    var values = years.map(function(year) {
        return {year: year, value: +d[year]}
    });
    return {category: d.Category, state: d.States, values: values};
}).then(function(dataset) {
    makeVis(dataset);
    var x = d3.scaleBand()
        .domain(dataset.map(function(d) { return d.state; }))
        .paddingInner(padding)
        .paddingOuter(padding)
        .range([0, width]);
    var y = d3.scaleBand()
        .domain(years)
        .paddingInner(padding)
        .range([0, height]);

    var z = d3.scaleQuantize()
        .domain([
            d3.min(dataset, function(datum) {
                return d3.min(datum.values, function(d) { return d.value; })
            }),
            d3.max(dataset, function(datum) {
                return d3.max(datum.values, function(d) { return d.value; })
            })
        ])
        .range(colors);

    var canvas = d3.select("#ranges")
        .append("svg")
        .attr("widht")


    svg.selectAll(".tile")
        .data(dataset)
        .enter()
        .append("g")
        .each(function(data) {
            d3.select(this).selectAll(".tile")
                .data(data.values)
                .enter()
                .append("rect")
                .attr("class", "tile")
                .attr("x", x(data.state))
                .attr("y", function (d) {
                    return y(d.year);
                })
                .attr("rx", radius)
                .attr("ry", radius)
                .attr("width", x.bandwidth())
                .attr("height", y.bandwidth())
                .style("fill", function (d) {
                    return z(d.value);
                });
      });


    xAxis = d3.axisBottom(x)
        .tickSize(0);

    yAxis = d3.axisLeft(y)
        .tickSize(0);

    svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis)
        .selectAll("text")
        .attr("y", 0)
        .attr("x", 0)
        .attr("dy", "1em")
        .attr("transform", "rotate(-60)")
        .style("text-anchor", "end");


    svg.append("g")
        .attr("class", "axis")
        .call(yAxis);

    svg.append("text")
        .attr("x", width/2)
        .attr("y", height + margin.bottom/2)
        .attr("text-anchor", "middle")
        .attr("alignment-baseline", "central")
        .attr("class", "label-text")
        .text("State");

    svg.append("text")
        .attr("class", "label-text")
        .attr("transform", "rotate(-90)")
        .attr("dominant-baseline", "hanging")
        .attr("text-anchor", "middle")
        .attr("y", -margin.left)
        .attr("x", -height / 2)
        .attr("text-anchor", "middle")
        .text("Year");

    var legendTileWidth = 60;
    var legendTileHeight = 30;
    var offsetX = 10;
    var offsetY = 20;

    var legend = svg.selectAll(".legend")
        .data(colors)
        .enter()
        .append("g")
        .attr("class", "legend");

    legend.append("rect")
        .attr("class", "tile")
        .attr("x", function(d, i) { return  offsetX + i * legendTileWidth; })
        .attr("y", height + margin.bottom - legendTileHeight - offsetY)
        .attr("width", legendTileWidth)
        .attr("height", legendTileHeight)
        .attr("fill", function(d) { return d; });

    var zDomainStart = z.domain()[0];
    var increment = (z.domain()[1] - z.domain()[0] ) / colors.length;

    legend.append("text")
        .attr("class", "axis")
        .attr("x", function(d, i) {return offsetX + i * legendTileWidth; })
        .attr("y", height + margin.bottom - offsetY)
        .attr("dy", 3)
        .attr("alignment-baseline", "hanging")
        .text(function(d, i) { return Math.round(zDomainStart + i * increment); });

    svg.append("text")
        .attr("class", "legend-text")
        .attr("x", offsetX)
        .attr("y", height + margin.bottom - offsetY - legendTileHeight - 5)
        .text("Count");

    // svg.append("circle")
    //     .attr("cx", offsetX)
    //     .attr("cy", height + margin.bottom - offsetY)
    //     .attr("r", 4)
    //     .attr("fill", "red");


});