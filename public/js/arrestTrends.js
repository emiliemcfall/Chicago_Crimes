(function () {
    // margins
    var margin = { top: 50, right: 160, bottom: 80, left: 50 },
        width = 900 - margin.left - margin.right,
        height = 500 - margin.top - margin.bottom;

    // color array
    var colorscale = ["darkred", "darkgreen"];

    // making a colorfunction based on the scale above
    var color = d3v3.scale.ordinal().range(colorscale);

    // defining format of dates
    var parseDate = d3v3.time.format("%m/%d/%Y").parse; // reading in date
    var formatDate = d3v3.time.format("%b %d, '%y"); // formatting date

    // create an SVG
    var svg = d3v3
        .select("#arrestTrends")
        .append("svg")
        .attr("width", width + margin.left + margin.right)
        .attr("height", height + margin.top + margin.bottom)
        .append("g")
        .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    // make a clip path for the graph
    var clip = svg
        .append("svg:clipPath")
        .attr("id", "clip")
        .append("svg:rect")
        .attr("x", 0)
        .attr("y", 0)
        .attr("width", width)
        .attr("height", height);

    // change data when manual input changes
    var menu = d3v3.select("#arrestTrendsMenu select").on("change", change);

    var formatted

    // read data and create the function "update" to be used for filtering
    d3v3.csv("/data/arrest-trends.csv", function (data) {
        formatted = data;
        update();
    });

    // event defining
    d3v3.select(window)
        .on("keydown", function () {
            altKey = d3v3.event.altKey;
        })
        .on("keyup", function () {
            altKey = false;
        });
    var altKey;

    // create the "speed" of the change
    function change() {
        d3v3.transition()
            .duration(altKey ? 7500 : 1500)
            .each(update);
    }

    // update the data when a change is made
    function update() {
        // create data nests based on crime type
        var nested = d3v3
            .nest()
            .key(function (d) {
                return d.type;
            })
            .map(formatted);

        // store the value of the theft
        var filteredData = menu.property("value");

        // filtering data based on above selection
        var data = nested[filteredData];

        // define column names from data
        color.domain(
            d3v3.keys(data[0]).filter(function (key) {
                return key !== "date" && key !== "type";
            })
        );

        var linedata = color.domain().map(function (name) {
            return {
                name: name,
                values: data.map(function (d) {
                    return {
                        name: name,
                        date: parseDate(d.date),
                        value: parseFloat(d[name], 10)
                    };
                })
            };
        });

        // temporary array to store values in
        var tmp = [];

        // setting up the x and y scales
        var x = d3v3.time
            .scale()
            .domain([
                d3v3.min(linedata, function (c) {
                    return d3v3.min(c.values, function (v) {
                        return v.date;
                    });
                }),
                d3v3.max(linedata, function (c) {
                    return d3v3.max(c.values, function (v) {
                        return v.date;
                    });
                })
            ])
            .range([0, width]);

        var y = d3v3.scale
            .linear()
            .domain([
                d3v3.min(linedata, function (c) {
                    return d3v3.min(c.values, function (v) {
                        return v.value;
                    });
                }),
                d3v3.max(linedata, function (c) {
                    return d3v3.max(c.values, function (v) {
                        return v.value;
                    });
                })
            ])
            .range([height, 0]);

        // drawing the line
        var line = d3v3.svg
            .line()
            .x(function (d) {
                return x(d.date);
            })
            .y(function (d) {
                return y(d.value);
            });

        // drawing the x-axis and appending to svg
        var xAxis = d3v3.svg
            .axis()
            .scale(x)
            .orient("bottom")
            .tickPadding(8)
            .ticks(10);

        svg.append("svg:g").attr("class", "x axis");

        // drawing the y-axis and appending to svg
        var yAxis = d3v3.svg
            .axis()
            .scale(y)
            .orient("left")
            .tickSize(0 - width)
            .tickPadding(8);

        svg.append("svg:g").attr("class", "y axis");

        // create the graph
        var mainplot = svg.selectAll(".mainplot").data(linedata);

        // link each line to g-tag
        var mainplotEnter = mainplot
            .enter()
            .append("g")
            .attr("clip-path", "url(#clip)")
            .attr("class", "mainplot")
            .attr("id", function (d) {
                return d.name + "-line";
            }) //highlight line legend at mouseover
            .style("stroke-width", 2.5)
            .on("mouseover", function (d) {
                // highlight strokes and legends
                d3v3.select(this).style("stroke-width", "4px");

                var selectmainplots = $(".mainplot").not(this);
                d3v3.selectAll(selectmainplots).style("opacity", 0.2);

                // extract column names
                var getname = document.getElementById(d.name);
                // select all other lines than the one highlighted
                var selectlegend = $(".legend").not(getname);

                // lower the opacity of all other lines
                d3v3.selectAll(selectlegend).style("opacity", 0.2);

                // legend change based on hovering
                d3v3.select(getname).attr("class", "legend-select");
            })
            // go back to "status-quo" settings when mousing out
            .on("mouseout", function (d) {
                d3v3.select(this).style("stroke-width", "2.5px");

                // deselcting everything and make opacity 1 again
                var selectmainplots = $(".mainplot").not(this);
                d3v3.selectAll(selectmainplots).style("opacity", 1);

                var getname = document.getElementById(d.name);
                var getname2 = $('.legend[fakeclass="fakelegend"]');
                var selectlegend = $(".legend")
                    .not(getname2)
                    .not(getname);

                d3v3.selectAll(selectlegend).style("opacity", 1);

                d3v3.select(getname).attr("class", "legend");
            });

        // append the filtered line to the graph
        mainplotEnter
            .append("path")
            .attr("class", "line")
            .style("stroke", function (d) {
                return color(d.name);
            })
            .attr("d", function (d) {
                return line(d.values[0]);
            })
            .transition()
            .duration(2000)
            .attrTween("d", function (d) {
                var interpolate = d3v3.scale
                    .quantile()
                    .domain([0, 1])
                    .range(d3v3.range(1, d.values.length + 1));
                return function (t) {
                    return line(d.values.slice(0, interpolate(t)));
                };
            });

        // append the legend corresponding to the filtered data
        var legend = svg.selectAll(".legend").data(linedata);

        var legendEnter = legend
            .enter()
            .append("g")
            .attr("class", "legend")
            .style('fill', 'white')
            .attr("id", function (d) {
                return d.name;
            });

        // place the legend scale with a range
        var legendscale = d3v3.scale
            .ordinal()
            .domain(tmp)
            .range([0, 30, 60, 90, 210]);

        // adding circles to the legend
        legendEnter
            .append("circle")
            .attr("cx", width + 20) // placement
            .attr("cy", function (d) {
                return legendscale(d.values[d.values.length - 1].value);
            })
            .attr("r", 7)
            .style("fill", function (d) {
                return color(d.name);
            });

        // add the column headers as legend text
        legendEnter
            .append("text")
            .attr("x", width + 35)
            .attr("y", function (d) {
                return legendscale(d.values[d.values.length - 1].value);
            })
            .text(function (d) {
                return d.name;
            });

        // updating the graph
        var mainplotUpdate = d3v3.transition(mainplot);

        // changement of the path values
        mainplotUpdate.select("path").attr("d", function (d, i) {
            tmp[i] = d.values[d.values.length - 1].value;
            tmp.sort(function (a, b) {
                return b - a;
            });
            legendscale.domain(tmp);

            return line(d.values);
        });

        // update the axes
        d3v3.transition(svg)
            .select(".y.axis")
            .call(yAxis);

        d3v3.transition(svg)
            .select(".x.axis")
            .attr("transform", "translate(0," + height + ")")
            .call(xAxis);
    }

    svg
        .append("svg:text")
        .attr("text-anchor", "start")
        .attr("x", 0 - margin.left)
        .attr("y", height + margin.bottom - 10)
        //.text (sourcetext)
        .attr("class", "source");
})();
