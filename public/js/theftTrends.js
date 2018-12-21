// margins
var marginA = { top: 50, right: 160, bottom: 80, left: 50 };
var widthA = 900 - marginA.left - marginA.right;
var heightA = 500 - marginA.top - marginA.bottom;

// color array
var colorscaleA = ["darkblue", "green", "darkgreen", "lightblue"];

// making a colorfunction based on the scale above
var colorA = d3v3.scale.ordinal().range(colorscale);

// defining format of dates
var parseDateA = d3v3.time.format("%m/%d/%Y").parse; // reading in date
var formatDateA = d3v3.time.format("%b %d, '%y"); // formatting date

//create an SVG
var svgA = d3v3
  .select("#theftTrends")
  .append("svg")
  .attr("width", widthA + marginA.left + marginA.right)
  .attr("height", heightA + marginA.top + marginA.bottom)
  .append("g")
  .attr("transform", "translate(" + marginA.left + "," + marginA.top + ")");

// make a clip path for the graph
var clip = svgA
  .append("svg:clipPath")
  .attr("id", "clip")
  .append("svg:rect")
  .attr("x", 0)
  .attr("y", 0)
  .attr("width", widthA)
  .attr("height", heightA);

var formattedA;

// read data and create the function "update" to be used for filtering
d3v3.csv("/data/theft-trends.csv", function(dataA) {
  formattedA = dataA;
  update();
});

// update the data when a change is made
function update() {
  // create data nests based on crime type
  var nestedA = d3v3
    .nest()
    .key(function(dA) {
      return dA.type;
    })
    .map(formattedA);

  // getting theft from dataframe
  var TheftA = "theft";

  // filtering data based on above selection
  var dataA = nestedA[TheftA];

  // define column names from data
  colorA.domain(
    d3v3.keys(dataA[0]).filter(function(keyA) {
      return keyA !== "date" && keyA !== "type";
    })
  );

  var linedataA = color.domain().map(function(nameA) {
    return {
      name: nameA,
      values: dataA.map(function(dA) {
        return {
          name: nameA,
          date: parseDate(dA.date),
          value: parseFloat(dA[nameA], 10)
        };
      })
    };
  });

  // temporary array to store values in
  var tmpA = [];

  // setting up the x and y scales
  var xA = d3v3.time
    .scale()
    .domain([
      d3v3.min(linedataA, function(cA) {
        return d3v3.min(cA.values, function(vA) {
          return vA.date;
        });
      }),
      d3v3.max(linedataA, function(cA) {
        return d3v3.max(cA.values, function(vA) {
          return vA.date;
        });
      })
    ])
    .range([0, widthA]);

  var yA = d3v3.scale
    .linear()
    .domain([
      d3v3.min(linedataA, function(cA) {
        return d3v3.min(cA.values, function(vA) {
          return vA.value;
        });
      }),
      d3v3.max(linedataA, function(cA) {
        return d3v3.max(cA.values, function(vA) {
          return vA.value;
        });
      })
    ])
    .range([heightA, 0]);

  // drawing the line
  var lineA = d3v3.svg
    .line()
    .x(function(dA) {
      return x(dA.date);
    })
    .y(function(dA) {
      return y(dA.value);
    });

  // drawing the x-axis and appending to svg
  var xAxisA = d3v3.svg
    .axis()
    .scale(xA)
    .orient("bottom")
    .tickPadding(8)
    .ticks(10);

  svgA.append("svg:g").attr("class", "x axis");

  // drawing the y-axis and appending to svg
  var yAxisA = d3v3.svg
    .axis()
    .scale(yA)
    .orient("left")
    .tickSize(0 - widthA)
    .tickPadding(8);

  svgA.append("svg:g").attr("class", "y axis");

  // create the graph
  var mainplotA = svg.selectAll(".mainplot").data(linedataA);

  // link each line to g-tag
  var mainplotEnterA = mainplotA
    .enter()
    .append("g")
    .attr("clip-path", "url(#clip)")
    .attr("class", "mainplot")
    .attr("id", function(d) {
      return d.name + "-line";
    }) //highlight line legend at mouseover
    .style("stroke-width", 2.5)
    .on("mouseover", function(d) {
      // highlight strokes and legends
      d3v3.select(this).style("stroke-width", "4px");

      var selectmainplotsA = $(".mainplot").not(this);
      d3v3.selectAll(selectmainplotsA).style("opacity", 0.2);

      // extract column names
      var getnameA = document.getElementById(dA.name);
      var selectlegendA = $(".legend").not(getnameA);

      // lower the opacity of all other lines
      d3v3.selectAll(selectlegendA).style("opacity", 0.2);

      // legend change based on hovering
      d3v3.select(getnameA).attr("class", "legend-select");
    })
    // go back to "status-quo" settings when mousing out
    .on("mouseout", function(dA) {
      d3v3.select(this).style("stroke-width", "2.5px");

      // deselcting everything and make opacity 1 again
      var selectmainplotsA = $(".mainplot").not(this);
      d3v3.selectAll(selectmainplotsA).style("opacity", 1);

      var getnameA = document.getElementById(dA.name);
      var getname2A = $('.legend[fakeclass="fakelegend"]');
      var selectlegendA = $(".legend")
        .not(getname2A)
        .not(getnameA);

      d3v3.selectAll(selectlegendA).style("opacity", 1);

      d3v3.select(getnameA).attr("class", "legend");
    });

  // appending data to graph
  mainplotEnterA
    .append("path")
    .attr("class", "line")
    .style("stroke", function(d) {
      return color(d.name);
    })
    .attr("d", function(d) {
      return line(d.values[0]);
    })
    .transition()
    .duration(2000)
    .attrTween("d", function(d) {
      var interpolateA = d3v3.scale
        .quantile()
        .domain([0, 1])
        .range(d3v3.range(1, d.values.length + 1));
      return function(t) {
        return line(d.values.slice(0, interpolate(t)));
      };
    });

  // appending the legend
  var legendA = svgA.selectAll(".legend").data(linedataA);

  var legendEnterA = legendA
    .enter()
    .append("g")
    .attr("class", "legend")
    .attr("id", function(d) {
      return d.name;
    });

  // place the legend scale with a range
  var legendscaleA = d3v3.scale
    .ordinal()
    .domain(tmpA)
    .range([0, 30, 60, 90, 120, 150, 180, 210]);

  // adding circles to the legend
  legendEnterA
    .append("circle")
    .attr("cx", widthA + 20)
    .attr("cy", function(d) {
      return legendscale(d.values[d.values.length - 1].value);
    })
    .attr("r", 7)
    .style("fill", function(d) {
      return color(d.name);
    });

  // add the column headers as legend text
  legendEnterA
    .append("text")
    .attr("x", widthA + 35)
    .attr("y", function(d) {
      return legendscale(d.values[d.values.length - 1].value);
    })
    .text(function(d) {
      return d.name;
    });

  // updating the graph
  var mainplotUpdateA = d3v3.transition(mainplotA);

  // update the axes,
  d3v3
    .transition(svgA)
    .select(".y.axis")
    .call(yAxisA);

  d3v3
    .transition(svgA)
    .select(".x.axis")
    .attr("transform", "translate(0," + heightA + ")")
    .call(xAxisA);
}

svgA
  .append("svg:text")
  .attr("text-anchor", "start")
  .attr("x", 0 - marginA.left)
  .attr("y", heightA + marginA.bottom - 10)
  .attr("class", "source");
