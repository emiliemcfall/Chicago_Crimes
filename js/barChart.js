d3.csv("crimes-aggregated.csv").then(d => chart(d));

function chart(csv) {

	csv.forEach(function(d) {
		d.crime = d.crime;
		d.value = +d.arrest + +d.no_arrest;
    d.year = +d.year;
		return d;
	})

  var years = [...new Set(csv.map(d => d.year))];
  var crimes = [...new Set(csv.map(d => d.crime))];
  var values = [new Set(csv.map(d => d.value))];

	// // Define the div for the tooltip
	var div = d3.select("body").append("div")
	    .attr("class", "tooltip")
	    .style("opacity", 0);


	var svg = d3.select("#chart"),
		margin = {top: 25, bottom: -50, left: 70, right: 25},
		width = +svg.attr("width") - margin.left - margin.right,
		height = +svg.attr("height") - margin.top - margin.bottom;

	var x = d3.scaleBand()
		.range([margin.left, width - margin.right])
		.padding(0.1)
		.paddingOuter(0.2)

	var y = d3.scaleLinear()
		.range([height - margin.bottom, margin.top])

  // var colour_scale = d3.scaleQuantile()
  // // // .range(["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);
  //   .range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
  //   "#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

	var xAxis = g => g
		.attr("transform", "translate(0," + (height - margin.bottom) + ")")
		.call(d3.axisBottom(x).tickSizeOuter(0))

	var yAxis = g => g
		.attr("transform", "translate(" + margin.left + ",0)")
		.call(d3.axisLeft(y))

	svg.append("g")
		.attr("class", "x-axis")

	svg.append("g")
		.attr("class", "y-axis")

	update(slider.value(), 0)

	function update(year, speed) {

		var data = csv.filter(f => f.year == year)

		y.domain([0, d3.max(data, d => d.value)]).nice()
    // colour_scale.domain([0, d3.max(data, d => d.value)])
    // console.log(d3.max(data, d => d.value));

		svg.selectAll(".y-axis").transition().duration(speed)
			.call(yAxis);

		data.sort(d3.select("#sort").property("checked")
			? (a, b) => b.value - a.value
			: (a, b) => crimes.indexOf(a.crime) - crimes.indexOf(b.crime))

		x.domain(data.map(d => d.crime))

		svg.selectAll(".x-axis").transition().duration(speed)
			.call(xAxis)
      .selectAll("text")
        .style("text-anchor", "end")
        .attr("dx", "-.5em")
        .attr("dy", "-.9em")
        .attr("transform", function(d) {
            return "rotate(-65)"
          });

		var bar = svg.selectAll(".bar")
			.data(data, d => d.crime)

		bar.exit().remove();

		bar.enter().append("rect")
			.attr("class", "bar")
			.attr("fill", "steelblue")
      // .attr('hover', 'red')
			.attr("width", x.bandwidth())
			.merge(bar)
      .on("mouseenter", function(d) {
        // d3.selectAll('.value')
        //   .attr('opacity', 0.6)
        d3.select(this)
          .attr('opacity', 0.6)
        div.transition()
          .duration(200)
          .style("opacity", .9);
        div.html('#Crimes: ' + (d.value))
          .style("left", (d3.event.pageX) + "px")
          .style("top", (d3.event.pageY - 28) + "px");
        })
      .on('mouseleave', function () {
        d3.select(this)
          .attr('opacity', 1)
        })
      // .on("mouseout", function(d) {
      //   div.transition()
      //     .duration(500)
      //     .style("opacity", 0);
      // })
        // .attr('fill', d => colour_scale(d.value))
		.transition().duration(speed)
			.attr("x", d => x(d.crime))
			.attr("y", d => y(d.value))
			.attr("height", d => y(0) - y(d.value))

	}
	chart.update = update;
}


var years = [2008,2009,2010,2011]

var slider = d3.sliderHorizontal()
  .min(d3.min(years))
  .max(d3.max(years))
  .step(1)
  .width(500)
  .tickFormat(d3.format(''))
  .tickValues(years)
  .on('onchange', val => {
    d3.select("p#value").text(val);
		chart.update(val, 750)
  });


var group = d3.select("div#slider").append("svg")
	.attr("width", 650)
	.attr("height", 100)
	.append("g")
	.attr("transform", "translate(30,30)");

group.call(slider);

d3.select("p#value").text(slider.value());
d3.select("a#setValue").on("click", () => { slider.value(2008); d3.event.preventDefault(); });


var checkbox = d3.select("#sort")
	.style("margin-left", "0%")
	.on("click", function() {
		chart.update(slider.value(), 750)
	})
