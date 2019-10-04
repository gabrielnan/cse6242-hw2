var margin = {top: 80, right: 90, bottom: 200, left: 50},
    width = window.innerWidth - margin.left - margin.right,
    height = 600 - margin.top - margin.bottom;

var radius = 3;

var svg = d3.select("body").append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

var years = ["2010", "2011", "2012", "2013", "2014", "2015"];
var ranges = ["0 to 9", "10 to 99", "100 to 499", "500 or above"];
var defaultRange = "0 to 9";
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
var padding = "0.08";

d3.dsv(",", "earthquakes.csv", function(d) {
    var values = years.map(function(year) {
        return {year: year, value: +d[year]}
    });
    return {category: d.Category, state: d.States, values: values};
}).then(function(dataset) {

    var x = d3.scaleBand()
        .paddingInner(padding)
        .paddingOuter(padding)
        .range([0, width]);

    var y = d3.scaleBand()
        .paddingInner(padding)
        .paddingOuter(padding)
        .range([0, height]);

    var z = d3.scaleQuantize()
        .range(colors);

    var xLabel = svg.append("g")
        .attr("class", "axis")
        .attr("transform", "translate(0," + height + ")");

    var yLabel = svg.append("g")
        .attr("class", "axis");

    var legendTileWidth = 60;
    var legendTileHeight = 30;
    var offsetX = 10;
    var offsetY = 20;

    svg.append("text")
        .attr("x", width/2)
        .attr("y", -margin.top)
        .attr("text-anchor", "middle")
        .attr("dominant-baseline", "hanging")
        .attr("class", "label-text")
        .text("Visualizing Earthquake Counts by State 2010-2015 (M3+)");

    svg.append("text")
        .attr("class", "legend-text")
        .attr("x", offsetX)
        .attr("y", height + margin.bottom - offsetY - legendTileHeight - 5)
        .text("Count");

    function getHandleMouseOver(state) {
        return function(d) {
            svg.append("text")
                .attr("class", "legend-text")
                .attr("id", "mouse-over-text")
                .attr("x", width / 2)
                .attr("y", -margin.top / 2)
                .attr("text-anchor", "middle")
                .attr("alignment-baseline", "middle")
                .text(state + " " + d.year + ": " + d.value);
        }
    }
    function handleMouseOut(d) {
        svg.select("#mouse-over-text").remove()
    }

    function update(range) {
        var filteredDataset = dataset.filter(function(d) {
            return d.category == range;
        });
        x.domain(filteredDataset.map(function(d) { return d.state; }));
        y.domain(years);
        z.domain([
            // d3.min(filteredDataset, function(datum) {
            //     return d3.min(datum.values, function(d) { return d.value; })
            // }),
            0,
            d3.max(filteredDataset, function(datum) {
                return d3.max(datum.values, function(d) { return d.value; })
            })
        ]);


        svg.selectAll(".tile").remove();
        var tiles = svg.selectAll(".tile")
            .data(filteredDataset);

        tiles.enter()
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
                    })
                    .on("mouseover", getHandleMouseOver(data.state))
                    .on("mouseout", handleMouseOut);
            });
        // tiles.transition();
        // tiles.exit().remove();

        var xAxis = d3.axisBottom(x)
            .tickSize(0);

        var yAxis = d3.axisLeft(y)
            .tickSize(0);

        xLabel
            .call(xAxis)
            .selectAll("text")
            .attr("y", 0)
            .attr("x", 0)
            .attr("dy", "1em")
            .attr("transform", "rotate(-60)")
            .style("text-anchor", "end");

        yLabel
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


        var zDomainStart = z.domain()[0];
        var increment = (z.domain()[1] - z.domain()[0] ) / colors.length;

        var colorsLegend = colors.map(function(d, i) {
            return {color: d, val: Math.round(zDomainStart + i * increment)};
        });

        var legend = svg.selectAll("legend").data(colorsLegend);

        legend
            .enter()
            .append("rect")
            .attr("class", "legend-tile")
            .attr("x", function(d, i) { return  offsetX + i * legendTileWidth; })
            .attr("y", height + margin.bottom - legendTileHeight - offsetY)
            .attr("width", legendTileWidth)
            .attr("height", legendTileHeight)
            .attr("fill", function(d) { return d.color; });

        svg.selectAll("#text-legend").remove();
        legend
            .enter()
            .append("text")
            .merge(legend)
            .attr("id", "text-legend")
            .attr("x", function(d, i) {return offsetX + i * legendTileWidth; })
            .attr("y", height + margin.bottom - offsetY)
            .attr("dy", 3)
            .attr("alignment-baseline", "hanging")
            .text(function(d) { return d.val; });


    }

    // Select Box
    // var ranges = Array.from(
    //     new Set(filteredDataset.map(function(d) { return d.category;})));

    function dropDownChange() {
        var newRange = d3.select(this).property("value");
        update(newRange);
    }

    var dropDown = d3.select("body").append("select")
        .attr("class", "select")
        .on("change", dropDownChange);

    dropDown.selectAll("option")
        .data(ranges)
        .enter()
        .append("option")
        .attr("class", "option")
        .property("selected", function(d){ return d === defaultRange; })
        .attr("value", function(d) { return d; })
        .text(function (d) { return d; });

    update(defaultRange);

    // svg.append("circle")
    //     .attr("cx", offsetX)
    //     .attr("cy", height + margin.bottom - offsetY)
    //     .attr("r", 4)
    //     .attr("fill", "red");


});