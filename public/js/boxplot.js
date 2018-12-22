(function () {
    //initialize the canvas dimensions
    var margin = { top: 10, right: 10, bottom: 20, left: 10 },
        width = 900 - margin.left - margin.right,
        height = 550 - margin.top - margin.bottom,
        padding = 0, labelWidth = 100,
        titleMargin = 0;

    // Define the div for the tooltip
    var div = d3.select("#boxplot").append("div")
        .attr("class", "tooltip")
        .style("opacity", 0);

    var svg = d3.select("#boxplot")
        .append("svg")
        .attr("width", width)
        .attr("height", height);

    //initialize the x scale
    var xScale = d3.scaleLinear()
        .range([labelWidth, width - padding]);

    var xAxis = g => g
        .attr("transform", "translate(0," + (height - margin.bottom) + ")")
        .call(d3.axisBottom(xScale).tickSizeOuter(10))

    // add potential background color to chart
    svg.append("rect")
        .attr("width", width)
        .attr("height", height)
        .attr("class", "nofill");

    //var palette = d3.scaleOrdinal(d3.schemeCategory20c);

    var palette = d3.scaleOrdinal(d3.schemeBlues[9]);

    // read data
    d3.csv("/data/thefts2018-boxplot.csv").then(function (csv) {
        csv.forEach(function (d) {
            d.crime = d.crime;
            d.season = d.season_string;
            d.arrest = +d.arrest;
            d.total = +d.total;
            return d;
        })
        // which measure to see. arrest, no arrest, total
        var col = "total";

        xScale.domain([0, 320]);

        // set the position of the y axis and append it
        var xAxisYPos = height - padding;
        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0, " + xAxisYPos + ")")
            .call(xAxis);

        // draw vertical grid lines
        svg.selectAll("line.verticalGrid")
            .data(xScale.ticks(10))
            .enter()
            .append("line")
            .attr("class", "verticalGrid")
            .attr("x1", function (d) { return xScale(d); })
            .attr("y1", xAxisYPos)
            .attr("x2", function (d) { return xScale(d); })
            .attr("y2", titleMargin + padding - 3);

        // set which category we want to group by and get them
        var groupingCategory = "season_string";
        var categories = d3.nest()
            .key(function (d) { return d[groupingCategory] })
            .entries(csv);

        // calculate how much canvas space we've got available to plot the data from each category
        var yCanvasSpaceForEach = (xAxisYPos - titleMargin) / (categories.length + 1)

        // iterate over each category and draw what you want on the plot
        for (var i = 0; i < categories.length; i++) {

            // filter the data by the current category
            var dataForCategory = csv.filter(function (d) {
                if (d[groupingCategory] == categories[i].key) { return d; }
                //console.log(d)
            });



            // calculate where to plot on the canvas (draws from top to bottom)
            var boxY = yCanvasSpaceForEach * (i + 1) + titleMargin;


            // draw box-and-whiskers plot
            drawBoxes(svg, dataForCategory, colToPlot = col, whiskerHeight = 15, boxHeight = 30, boxY, boxNumber = i);
            // change the total to arrest or no arrest

            //var season = ["Winter","Sprig","Summer","Fall"]

            // draw data points
            drawPoints(svg, dataForCategory, colToPlot = col, colToHover = "season_string", pointSize = 3.5,
                outlierSize = 5, boxY, yDisplacement = 25, jitterAmount = 3, categoryIndex = i, hoverX = -5, hoverY = -10);

            // draw labels
            drawCategoryLabels(svg, label = categories[i].key, fontsize = 13, xPlacement = 5, boxY, yDisplacement = 4);
        }
    });

    // function to build boxplot
    // function to calculate statistics summary
    function BoxCalculation(data) {
        // initialise stats object
        var BoxStatistics = {
            outliers: [],
            minVal: Infinity,
            lowerWhisker: Infinity,
            q1Val: Infinity,
            medianVal: 0,
            q3Val: -Infinity,
            iqr: 0,
            upperWhisker: -Infinity,
            maxVal: -Infinity
        };

        // sort the data ascending
        data = data.sort(d3.ascending);

        //calculate statistics
        BoxStatistics.minVal = data[0],
            BoxStatistics.q1Val = d3.quantile(data, .25),
            BoxStatistics.medianVal = d3.quantile(data, .5),
            BoxStatistics.q3Val = d3.quantile(data, .75),
            BoxStatistics.iqr = BoxStatistics.q3Val - BoxStatistics.q1Val,
            BoxStatistics.maxVal = data[data.length - 1];

        var index = 0;

        //search for the lower whisker, the minimum value within q1Val - 1.5*iqr
        while (index < data.length && BoxStatistics.lowerWhisker == Infinity) {
            if (data[index] >= (BoxStatistics.q1Val - 1.5 * BoxStatistics.iqr))
                BoxStatistics.lowerWhisker = data[index];
            else
                BoxStatistics.outliers.push(data[index]);
            index++;
        }

        index = data.length - 1; // reset index to end of array

        //search for the upper whisker, the maximum value within q1Val + 1.5*iqr
        while (index >= 0 && BoxStatistics.upperWhisker == -Infinity) {
            if (data[index] <= (BoxStatistics.q3Val + 1.5 * BoxStatistics.iqr))
                BoxStatistics.upperWhisker = data[index];
            else
                BoxStatistics.outliers.push(data[index]);
            index--;
        }

        return BoxStatistics;
    }

    function drawBoxes(svg, csv, colToPlot, whiskerHeight, boxHeight, boxY, categoryIndex) {
        // make an array of the data to plot
        var data = csv.map(function (d) {
            return +d[colToPlot]; // coerce to a number
        });

        // get statistics for this data
        boxStats = BoxCalculation(data);

        //draw vertical line for lowerWhisker
        svg.append("line")
            .attr("class", "whisker")
            .attr("x1", xScale(boxStats.lowerWhisker))
            .attr("x2", xScale(boxStats.lowerWhisker))
            .attr("stroke", "white")
            .attr("y1", boxY - (whiskerHeight / 2))
            .attr("y2", boxY + (whiskerHeight / 2));

        //draw vertical line for upperWhisker
        svg.append("line")
            .attr("class", "whisker")
            .attr("x1", xScale(boxStats.upperWhisker))
            .attr("x2", xScale(boxStats.upperWhisker))
            .attr("stroke", "white")
            .attr("y1", boxY - (whiskerHeight / 2))
            .attr("y2", boxY + (whiskerHeight / 2));

        //draw horizontal line from lowerWhisker to 1st quartile
        svg.append("line")
            .attr("class", "whisker")
            .attr("x1", xScale(boxStats.lowerWhisker))
            .attr("x2", xScale(boxStats.q1Val))
            .attr("stroke", "white")
            .attr("y1", boxY)
            .attr("y2", boxY);

        //draw rect for iqr
        svg.append("rect")
            .attr("class", "box")
            .attr("stroke", "white")
            .attr("fill", palette(categoryIndex))       // sets new color for each box
            .attr("x", xScale(boxStats.q1Val))
            .attr("y", boxY - (boxHeight / 2))
            .attr("width", xScale(boxStats.q3Val) - xScale(boxStats.q1Val))
            .attr("height", boxHeight);

        //draw horizontal line from 3rd quartile to upperWhisker
        svg.append("line")
            .attr("class", "whisker")
            .attr("x1", xScale(boxStats.q3Val))
            .attr("x2", xScale(boxStats.upperWhisker))
            .attr("stroke", "white")
            .attr("y1", boxY)
            .attr("y2", boxY);

        //draw vertical line at median
        svg.append("line")
            .attr("class", "median")
            .attr("x1", xScale(boxStats.medianVal))
            .attr("x2", xScale(boxStats.medianVal))
            .attr("y1", boxY - (boxHeight / 2))
            .attr("y2", boxY + (boxHeight / 2));
    }

    function drawPoints(svg, csv, colToPlot, colToHover, pointSize, outlierSize, boxY,
        yDisplacement, jitterAmount, categoryIndex, hoverX, hoverY) {

        boxY = boxY + yDisplacement;

        function random_jitter(boxY) {
            if (Math.round(Math.random() * 1) == 0)
                var seed = -jitterAmount;
            else
                var seed = jitterAmount;
            return boxY + Math.floor((Math.random() * seed) + 1);
        }

        // make an array of the data we want to plot
        var data = csv.map(function (d) {
            return +d[colToPlot];
        });

        // get statistics
        boxStats = BoxCalculation(data);

        // make a grouping for each data point
        var dataPoints = svg
            .selectAll(".dataPoints" + categoryIndex)   //select only data points drawn in the current iteration
            .data(csv)
            .enter()
            .append("g")
            .attr("class", "dataPoints" + categoryIndex)
            .attr("transform", function (d) {
                return "translate(" + xScale(d[colToPlot]) + "," + random_jitter(boxY) + ")";
            })

        // draw the data points as circles
        dataPoints
            .append("circle")
            .attr("r", function (d) {
                if (d[colToPlot] < boxStats.lowerWhisker || d[colToPlot] > boxStats.upperWhisker)
                    return outlierSize;
                else
                    return pointSize;
            })
            .attr("class", function (d) {
                if (d[colToPlot] < boxStats.lowerWhisker || d[colToPlot] > boxStats.upperWhisker)
                    return "outlier";
                else
                    return "point";
            })
            .attr("fill", palette(categoryIndex));
    }

    /*  ***function to draw the category labels***
    *   arguments:
    *       svg: the svg to plot on
    *       category: string with the category label to plot
    *       xDisplacement: where on the horisontal axis should the label be shown?
    *       boxY: the y coordinate where the data for the category has been plotted
    *       yDisplacement: any desired displacement up or down of the text
    */
    function drawCategoryLabels(svg, label, fontsize, xPlacement, boxY, yDisplacement) {
        svg
            .append("text")
            .attr("class", "categoryLabel")
            .text(label)
            .style("font-size", fontsize)
            .style("font-weight", 400)
            .style('fill', 'white')
            .attr("x", xPlacement)
            .attr("y", boxY + yDisplacement)
    }
})();