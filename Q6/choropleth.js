var margin = {top: 50, right: 50, bottom: 50, left: 50},
    width = window.innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var projection = d3.geoAlbersUsa()
    .scale([width]);
var path = d3.geoPath(projection);
var counts = d3.map();
var regionMap = d3.map();

var colors = d3.schemeReds[9];
var colorScale = d3.scaleQuantize()
    .range(colors)
    .domain([1, 2]);
var logScale = d3.scaleLog()
    .range([1, 2]);
var scale = d => colorScale(logScale(d3.max([d, 1])));

function strong(text) {
    return "<strong>" + text + "</strong>"
}

var tip = d3.tip()
    .attr("class", "tip")
    .offset([-10, 0])
    .html(function(d) {
        var state = d.properties.name;
        var region = regionMap.get(state);
        var count = counts.get(state);

        return "State: " + strong(state) +
            "<br>Region: " + strong(region) +
            "<br>Earthquakes: " + strong(count) + "</span>";
    });
svg.call(tip);
function handleMouseOver(d) {
    tip.show(d);
    d3.select(this)
        .attr("stroke", "white")
        .attr("stroke-width", "3")
}

function handleMouseOut(d) {
    tip.hide(d);
    d3.select(this)
        .attr("stroke", "none")
        .attr("stroke", "none")
}


var promises = [
    d3.json("states-10m.json"),
    d3.dsv(",", "state-earthquakes.csv", function(d) {
        counts.set(d.States, +d["Total Earthquakes"]);
        regionMap.set(d.States, d.Region);
    })];
Promise.all(promises).then(function([topo]) {
    logScale.domain([
        d3.max([d3.min(counts.values()), 1]),
        d3.max(counts.values())
    ]);

    svg.selectAll("path")
        .data(topojson.feature(topo, topo.objects.states).features)
        .enter()
        .append("path")
        // .attr("transform", "translate(" + (-200) + "," + height/2 + ")")
        .attr("fill", d => scale(counts.get(d.properties.name)))
        .attr("d", path)
        .on("mouseover", handleMouseOver)
        .on("mouseout", handleMouseOut);

    svg.append("path")
        .datum(topojson.mesh(topo, topo.objects.states, function(a, b) { return a !== b; }))
        .attr("class", "states")
        .attr("d", path);

    svg.selectAll("path")
        .attr("transform", "translate(" + ((width - 950)/2 - 100) + ", 0)");


    var legend = svg.append("g")
        .attr("class", "legend")
        .attr("transform", "translate(" + (width) + "," + 100 + ")");

    legend.append("text")
        .attr("class", "legend-title")
        .attr("text-anchor", "end")
        .text("Earthquake Frequency");

    var size = 20;
    function yLoc(d, i) {
        return 10 + i * (size + 5);
    }

    legend.selectAll(".square")
        .data(colors)
        .enter()
        .append("rect")
        .attr("class", "square")
        .attr("width", size)
        .attr("height", size)
        .attr("x", -110)
        .attr("y", yLoc)
        .attr("fill", d => d);

    legend.selectAll(".legend-text")
        .data(colors)
        .enter()
        .append("text")
        .attr("class", "legend-text")
        .attr("alignment-baseline", "middle")
        .attr("x", -80)
        .attr("y", yLoc)
        .attr("dy", size /2)
        .text(d => Math.round(logScale.invert(colorScale.invertExtent(d)[0])));

});

//
// var nums = ["a", "b", "i"];
// svg.selectAll("rect")
//     .data(nums)
//     .enter()
//     .append("rect")
//     .attr("width", 50)
//     .attr("height", 50)
//     .attr("x", function(d, i) { return i * 50;})
//     .attr("y", 0)
//     .attr("fill", d => colorScale(d));
