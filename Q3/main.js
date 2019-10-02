var margin = {top: 50, right: 100, bottom: 80, left: 80}
    , width = 960 - margin.left - margin.right
    , height = 600 - margin.top - margin.bottom;
var parseTime = d3.timeParse("%Y");
var colors = {
    '5_5.9': '#FFC300',
    '6_6.9': '#FF5733',
    '7_7.9': '#C70039',
    '8.0+': '#900C3F'};

var fields = Object.keys(colors);

var base_title = "Worldwide Earthquake stats 2000-2015";
dataset = d3.dsv(",", "earthquakes.csv", function(d) {
    var obj = {year: parseTime(d.year)};
    fields.forEach(function(field) {
        obj[field] = +d[field]
    });
    obj.estimated_deaths = +d["Estimated Deaths"];
    return obj;
}).then(function(dataset) {
    base_chart(dataset, base_title, d3.scaleLinear());
    pagebreak();

    var result = base_chart(dataset, base_title + " with symbols");
    add_circles(dataset, result.svg, result.xScale, result.yScale);
    pagebreak();

    var result = base_chart(dataset, base_title + " square root scale",
        d3.scaleSqrt());
    add_circles(dataset, result.svg, result.xScale, result.yScale);
    pagebreak();

    var result = base_chart(dataset, base_title + " log scale",
        d3.scaleLog(),
        function(val) {
            if (val <= 0) {
                return 1;
            }
            return val;
        },
        1);
    add_circles(dataset, result.svg, result.xScale, result.yScale);

});

