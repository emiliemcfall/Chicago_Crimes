var width = document.getElementById('vis')
.clientWidth;
var height = document.getElementById('vis')
.clientHeight;

var margin = {
  top: 10,
  bottom: 225,
  left: 70,
  right: 20
}

var svg = d3.select('#vis')
.append('svg')
.attr('width', width)
.attr('height', height)
.append('g')
.attr('transform', 'translate(' + margin.left + ',' + margin.right + ')');

width = width - margin.left - margin.right;
height = height - margin.top - margin.bottom;

var data = {};

var x_scale = d3.scaleBand()
.rangeRound([0, width])
.padding(0.1);

var y_scale = d3.scaleLinear()
.range([height, 0]);

var colour_scale = d3.scaleQuantile()
// .range(["#ffffe5", "#fff7bc", "#fee391", "#fec44f", "#fe9929", "#ec7014", "#cc4c02", "#993404", "#662506"]);
.range(["#5E4FA2", "#3288BD", "#66C2A5", "#ABDDA4", "#E6F598",
"#FFFFBF", "#FEE08B", "#FDAE61", "#F46D43", "#D53E4F", "#9E0142"]);

var y_axis = d3.axisLeft(y_scale);
var x_axis = d3.axisBottom(x_scale);

svg.append('g')
  .attr('class', 'x axis')
  .attr("transform", 'translate(0,' + height + ')');
  // .call(x_axis)
  // .selectAll("text")
    // .attr("transform", function(d) {
    //     return "rotate(-65)"
    //   });
    // .attr("transform", 'rotate(-90, ' + height + ')');
  // .call(x_axis)
  // .selectAll("text")
  //   .style("text-anchor", "end")
  //   // .attr("dx", "-.5em")
  //   // .attr("dy", "-.9em")
  //   .attr("transform", function(d) {
  //       return "rotate(-65)"
  //     });

svg.append('g')
.attr('class', 'y axis');

d3.csv("crimes-aggregated.csv", function(error, data) {
  // Filter according to year
  //var csv_data = data
  function draw(year, speed) {
    //[year];
    let csv_data = data.filter(function(d) {
      return ( d['year'] == year );
    });

    var t = d3.transition()
    .duration(speed);

    var crime_types = csv_data.map(function(d) {
      return d.crime_type;
    });
    //var crime_types = csv_data.crime_type;
    x_scale.domain(crime_types);

    var max_value = d3.max(csv_data, function(d) {
      return +d.value;
    });

    y_scale.domain([0, max_value]);
    colour_scale.domain([0, max_value]);


    // if (sort) {
    //   csv_data.sort(d3.select("#sort").property("checked")
    //     ? (a, b) => b.value - a.value
    //     : (a, b) => crime_types.indexOf(a.crime_type) - crime_types.indexOf(b.crime_type))
    //     console.log(a)
    // };
    var bars = svg.selectAll('.bar')
    .data(csv_data)

    bars
    .exit()
    .remove();

    var new_bars = bars
    .enter()
    .append('rect')
    .attr('class', 'bar')
    .attr('x', function(d) {
      return x_scale(d.crime_type);
    })
    .attr('width', x_scale.bandwidth())
    .attr('y', height)
    .attr('height', 0)

    new_bars.merge(bars)
    .transition(t)
    .attr('y', function(d) {
      return y_scale(+d.value);
    })
    .attr('height', function(d) {
      return height - y_scale(+d.value)
    })
    .attr('fill', function(d) {
      return colour_scale(+d.value);
    })

    // bars.enter()
    //     .append("rect")
    //     .attr("class", "bar")
    //     .attr("fill", function(d){
    //         if(d.gender === "female"){
    //             return "#FDB462";
    //         }else{
    //             return "#B3DF68";
    //         }
    //     })
    //     .attr("class", function(d) {
    //         return d3.select(this).attr("class") + " " +  "m_" +
    //             d.label.replace(/\s/g, "").replace("-","_");
    //     })

    svg.select('.x.axis')
    .call(x_axis)
    .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.5em")
      .attr("dy", "-.9em")
      .attr("transform", function(d) {
          return "rotate(-65)"
        });

    svg.select('.y.axis')
    .transition(t)
    .call(y_axis);
    //
    //
    // d3.select("#sort").on("change", sort);
    // function sort() {

    // };
  };

  // Initiate
  var speed = 1500
  draw('2011', speed*1.25, false);
  //
  var slider = d3.select('#year');
  slider.on('change', function() {
    draw(this.value, speed);
    // console.log(parseInt(this.value));
  });

  // var checkbox = d3.select("#sort")
  // 	.style("margin-left", "45%")
  // 	.on("click", function() {
  //     draw(this.value, speed);
      // chart.update(select.property("value"), 750)
  	// });
});

// d3.queue()
//     //.defer(d3.csv, 'crimes_arrest.csv')
//     // .defer(d3.csv, 'monthly_data_2013.csv'), , d2013
//     .await(function(error, d2014) {
//         // data['2013'] = d2013;
//         data['2014'] = d2014;
//         draw('2014');
//     });
