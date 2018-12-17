// Load data files
d3.csv("age-groups.csv").then(d => chart(d));

function chart(csv) {

  // create the svg
  var svg = d3.select("#chart"),
      margin = {top: 20, right: 20, bottom: 30, left: 40},
      width = +svg.attr("width") - margin.left - margin.right,
      height = +svg.attr("height") - margin.top - margin.bottom,
      g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

  // set x scale
  var x = d3.scaleBand()
      .rangeRound([0, width])
      .paddingInner(0.05)
      .align(0.1);

  // set y scale
  var y = d3.scaleLinear()
      .rangeRound([height, 0]);

  // set the colors
  var z = d3.scaleOrdinal()
      .range(["#98abc5", "#8a89a6", "#7b6888", "#6b486b", "#a05d56", "#d0743c", "#ff8c00"]);

  var xAxis = g => g
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x).tickSizeOuter(0))

	var yAxis = g => g
		.attr("transform", "translate(" + margin.left + ",0)")
		.call(d3.axisLeft(y))

  var stack = d3.stack();

	svg.append("g")
		.attr("class", "x-axis")

	svg.append("g")
		.attr("class", "y-axis")

  // Initialize
  update(2008, 'a', 100)

  function update(year, crime, speed) {

    var dat = csv.filter(f => f.year == year);
    var data = dat.filter(f => f.crime == crime)

    var keys = ['a','b']
    // console.log(keys)

    data.sort(function(a, b) { return b.total - a.total; });
    x.domain(data.map(d => d.State));
    y.domain([0, d3.max(data, d => d.total)]).nice();
    z.domain(keys);


    svg.selectAll(".x-axis").transition().duration(speed)
      .call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("dy", "-.9em")
        .attr("transform", function(d) {
            return "rotate(-65)"
          });

    svg.selectAll(".y-axis").transition().duration(speed)
  		.call(yAxis);


    // var bar = svg.selectAll('.bar')
    //   .data(d3.stack().keys()(data));
    //
    // bar.exit().remove();
    //
    // bar.enter().append('rect')
    //   .attr('class', 'bar')
    //   .attr("fill", function(d) { return z(d.key); })
    //   .selectAll('rect')
    //   .data(function(d) {return d;})
    //   enter().append('rect')
    //   .attr("x", function(d) { return x(d.data.State); })
    //   .attr("y", function(d) { return y(d[1]); })
    //   .attr("height", function(d) { return y(d[0]) - y(d[1]); })
    //   .attr("width", x.bandwidth());


    svg.append("g")
      .selectAll("g")
      .data(d3.stack().keys(keys)(data))
      .enter().append("g")
        .attr("fill", function(d) { return z(d.key); })
      .selectAll("rect")
      .data(function(d) { return d; })
      .enter().append("rect")
        .attr("x", function(d) { return x(d.data.State); })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", x.bandwidth());

      // console.log(d3.stack().keys(keys)(data));
      //
      //   var bar = svg.selectAll(".bar")
    	// 		//.data(data, d => d.State)
      //     .data(d3.stack().keys()(data));
      //   console.log(bar)
      //
      //   // console.log(d3.stack().keys()(data))
      //
    	// 	bar.exit().remove();
      //
    	// 	bar.enter().append("rect")
    	// 		.attr("class", "bar")
    	// 		.attr("fill", 'steelblue') //function(d) { return z(d.key); }
      //     // .attr('hover', 'red')
    	// 		.attr("width", x.bandwidth())
    	// 		.merge(bar)
    	// 	.transition().duration(speed)
    	// 		.attr("x", d => x(d.State))
    	// 		.attr("y", d => y(d.value))
    	// 		.attr("height", d => y(0) - y(d.value))


























    var legend = svg.append("g")
        .attr("font-family", "sans-serif")
        .attr("font-size", 10)
        .attr("text-anchor", "end")
      .selectAll("g")
      .data(keys.slice().reverse())
      .enter().append("g")
        .attr("transform", function(d, i) { return "translate(0," + i * 20 + ")"; });

    legend.append("rect")
        .attr("x", width - 19)
        .attr("width", 19)
        .attr("height", 19)
        .attr("fill", z);

    legend.append("text")
        .attr("x", width - 24)
        .attr("y", 9.5)
        .attr("dy", "0.32em")
        .text(function(d) { return d; });
      };
      chart.update = update;
};

var years = [2008,2009,2010,2011,2012,2013,2014,2015,2016,2017,2018]

var slider = d3.sliderHorizontal()
  .min(d3.min(years))
  .max(d3.max(years))
  .step(1)
  .width(500)
  .tickFormat(d3.format(''))
  .tickValues(years)
  .on('onchange', val => {
    d3.select("p#value").text(val);
		chart.update(val, 'ARSON', 750)
    console.log(val);
  });

var group = d3.select("div#slider").append("svg")
	.attr("width", 650)
	.attr("height", 100)
	.append("g")
	.attr("transform", "translate(30,30)");

group.call(slider);

d3.select("p#value").text(slider.value());
d3.select("a#setValue").on("click", () => { slider.value(2008); d3.event.preventDefault(); });

// var checkbox = d3.select("#sort")
// 	.style("margin-left", "0%")
// 	.on("click", function() {
// 		chart.update(slider.value(), 'ARSON', 750)
// 	})
