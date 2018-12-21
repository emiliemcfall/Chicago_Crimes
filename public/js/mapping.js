var width = 680,
    height = 480,
    active = d3.select(null);

var projection = d3.geoAlbers() // updated for d3 v4
    .scale(50000)
    .translate([width / 2, height / 2])
    .center([8.3, 41.8781]);

var zoom = d3.zoom()
    // no longer in d3 v4 - zoom initialises with zoomIdentity, so it's already at origin
    // .translate([0, 0])
    // .scale(1)
    .scaleExtent([1, 3])
    .on("zoom", zoomed);

var path = d3.geoPath() // updated for d3 v4
    .projection(projection);

var svg = d3.select("#mapping").append("svg")
    .attr("width", width)
    .attr("height", height)
    .on("click", stopped, true);

svg.append("rect")
    .attr("class", "background")
    .attr("width", width)
    .attr("height", height)
    .on("click", reset);

var g = svg.append("g");

svg
    .call(zoom);

d3.json("/data/police-borders.geojson").then(function (geojson) {


    g.selectAll("path")
        .data(geojson.features)
        .enter().append("path")
        .attr("d", path)
        .attr("class", "feature")
        .on("click", clicked);


});


var dx_valarr = [];
var dy_valarr = [];
var dis_numarr = [];
var income = [];
var dis_name = [];
var males = [];
var females = [];
var avg_age = [];
var married = [];

d3.csv("./data/stats.csv").then(function (data) {

    for (var d = 0; d < data.length; d++) {
        dx_valarr.push(parseFloat(data[d].dx_val));
        dy_valarr.push(parseFloat(data[d].dy_val));
        dis_numarr.push(parseFloat(data[d].dis_num));
        income.push(parseFloat(data[d].income));
        dis_name.push((data[d].district_name));
        males.push((data[d].male));
        females.push(data[d].female);
        married.push(data[d].married);
        avg_age.push(data[d].avg_age);

    }


});


function moveNumbers(number) {
    document.getElementById("result").value = number;
}

function clicked(d) {
    if (active.node() === this) return reset();
    active.classed("active", false);
    active = d3.select(this).classed("active", true);

    var bounds = path.bounds(d),
        dx = bounds[1][0] - bounds[0][0],
        dy = bounds[1][1] - bounds[0][1],
        x = (bounds[0][0] + bounds[1][0]) / 2,
        y = (bounds[0][1] + bounds[1][1]) / 2,
        scale = Math.max(1, Math.min(8, 0.9 / Math.max(dx / width, dy / height))),
        translate = [width / 2 - scale * x, height / 2 - scale * y];

    //console.log(dx + ' ' + dy + ' ' + x + ' ' + y);

    removeElements(document.querySelectorAll('div'));
    var div = document.createElement('div');
    div.style.backgroundColor = "none";
    div.style.position = "absolute";
    div.style.left = "800px";
    div.style.top = "50px";
    div.style.height = "350px";
    div.style.width = "250px";
    div.style.color = "white";
    div.style.size = "15px";


    document.getElementsByTagName('body')[0].appendChild(div);
    console.log(dis_numarr[1])
    for (var d = 0; d < dx_valarr.length; d++) {
        var twoPlacedFloat_dx = parseFloat(dx).toFixed(2)
        var dx_valarr_twoPlacedFloat = parseFloat(dx_valarr[d]).toFixed(2)
        if (twoPlacedFloat_dx == dx_valarr_twoPlacedFloat) {
            var br0 = document.createElement("br");
            div.appendChild(br0);
            var d_name = document.createTextNode("Welcome to " + dis_name[d] + '!');
            div.appendChild(d_name);
            var br10 = document.createElement("br");
            div.appendChild(br10);
            var br110 = document.createElement("br");
            div.appendChild(br110);
            var br2 = document.createElement("br");
            div.appendChild(br2);
            var newContent = document.createTextNode("District Number: " + dis_numarr[d]);
            div.appendChild(newContent);
            var br = document.createElement("br");
            div.appendChild(br);
            var inc = document.createTextNode("Average Income: " + income[d]);
            div.appendChild(inc);
            var br3 = document.createElement("br");
            div.appendChild(br3);
            var m = document.createTextNode("Percentage of Males: " + males[d]);
            div.appendChild(m);
            var br4 = document.createElement("br");
            div.appendChild(br4);
            var f = document.createTextNode("Percentage of Females: " + females[d]);
            div.appendChild(f);
            var br5 = document.createElement("br");
            div.appendChild(br5);
            var m_a = document.createTextNode("Median Age: " + avg_age[d]);
            div.appendChild(m_a);
            var br6 = document.createElement("br");
            div.appendChild(br6);
            var marr = document.createTextNode("Percentage of Married Population: " + married[d]);
            div.appendChild(marr);


        }

    }



    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity.translate(translate[0], translate[1]).scale(scale));
}

function removeElements(elements) {
    for (var i = 0; i < elements.length; i++) {
        elements[i].parentNode.removeChild(elements[i]);
    }
}



function reset() {
    active.classed("active", false);
    active = d3.select(null);

    svg.transition()
        .duration(750)
        .call(zoom.transform, d3.zoomIdentity);

    removeElements(document.querySelectorAll('div'));

}

function zoomed() {
    g.style("stroke-width", 1.5 / d3.event.transform.k + "px");
    g.attr("transform", d3.event.transform);
}


function stopped() {
    if (d3.event.defaultPrevented) d3.event.stopPropagation();
}
