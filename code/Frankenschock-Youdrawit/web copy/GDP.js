// INDIVIDUAL SETTINGS FOR THIS GRAPH
var datafile = "GDP.csv";
var cutoffMoment = '2015-01-01';
var xMinMax = ['2013-01-01', '2017-04-01']
var yMinMax = [95, 110];

// BASIC ELEMENTS OF THE GRAPH ACCORDING TO CONVENTIONS
var svg = d3.select("svg"),
    margin = {top: 80, right: 40, bottom: 80, left: 60},
    width = svg.attr("width") - margin.left - margin.right,
    height = svg.attr("height") - margin.top - margin.bottom,
    g = svg.append("g").attr("transform", "translate(" + margin.left + "," + margin.top + ")");

// ADDITIONAL ELEMENTS ON THE GRAPH
//- Border around the canvas
var border = g.append("rect")
              .attr("x", 0)
              .attr("y", 0)
              .attr("width", width)
              .attr("height", height)
              .attr("class", "border");

// - The rectangle used to clip the correct line
var clipRect = g.append('clipPath')
                .attr('id', 'clip')
                  .append('rect')
                  .attr('width', 1)
                  .attr('height', height);

// - the <path> fot the correct line itself
var correctPath = g.append('g')
                  .attr('clip-path', 'url(#clip)');

// - The button to expand the clipping
var gButton = svg.append("g")
                 .attr("transform", "translate(" + (margin.left + width / 2 - 100) + "," + (margin.top + height + 40) + ")");

var showButton = gButton.append('rect')
                        .attr('width', 200)
                        .attr('height', 40)
                        .attr('rx', 10)
                        .attr('ry', 10)
                        .attr('class', 'button');

var showButtonText = gButton.append('text')
                            .attr('x', 45)
                            .attr('y', "1.5em")
                            .attr('class', 'button-text').text('Werte anzeigen');

// EMPTY CONTAINER FOR LATER
var yourData = [];
var barWidth = 0;
var barDistance = 14;

// AXES
var x = x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

// HELPER FUNCTIONS USED TO DEAL WITH TIME
var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%Y-%m-%d");

// HELPER FUNCTION TO RESTRICT MOUSE INPUT TO CANVAS
function clamp(a, b, c) {
  return Math.max(a, Math.min(b, c));
}

// HELPER FUNCTION TO PARSE THE DATA
function type(d, _, columns) {
  d.date = parseTime(d.date);
  return d;
}

// LOAD THE DATA AND DRAW THE LINES - BEFORE USER INTERACTION
d3.csv(datafile, type, function(error, data) {
  if (error) throw error;

  // container for the loaded data, just rename it for clarity
  var correctData = data;

  // container for the user data, initially has correct values but is invisible
  yourData = data.map(function(d) { return {date: d.date, value: d.value, defined: 0} })
                      .filter(function(d) {
                        if (d.date == parseTime(cutoffMoment)) {d.defined = true };
                        return d.date >= parseTime(cutoffMoment);
                      });

  // adjust the scales according to the data (x-axis) and manually (y-axis)
  x.domain([parseTime(xMinMax[0]),parseTime(xMinMax[1])])
  y.domain(yMinMax);

  // calculate the parameter for the bars
  barWidth = width / data.length - barDistance;

  // generate the Axes
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeYear).tickSize(height * (-1)))
    .selectAll(".tick text").attr("dy", 16).attr("dx", 16);

  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(4).tickSize(width * (-1)))
    .selectAll(".tick text").attr("dx", -5);

  // adjust the clipping rectangle according to the data
  clipRect.attr('width', x(parseTime(cutoffMoment)));

  // add rectangles (with .bar class) for each data point in the actual data
  correctPath.selectAll(".bar")
    .data(data)
    .enter().append("circle")
      .attr("class", "bar")
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d.value); })
      .attr("r", barWidth / 2);

  // add rectangles (with .bar class) for each data point in the user data, they are zero height for now
  g.selectAll(".your-bar")
    .data(yourData)
    .enter().append("circle")
      .attr("class", "your-bar")
      .attr("cx", function(d) { return x(d.date); })
      .attr("cy", function(d) { return y(d.value); })
      .attr("r", 0);

});

// IMIPLEMENT THE USER DRAWING FUNCTION
svg.call(d3.drag().on('drag', function() {

  // transform current mouse pointer from svg-coordinates into domain-related coordinates
  var pos = d3.mouse(this);
  var date = clamp(parseTime(cutoffMoment), x.domain()[1], x.invert(pos[0] - margin.left));
  var value = clamp(y.domain()[0], y.domain()[1], y.invert(pos[1] - margin.top));

  // if mouse drag event happens, modify the nearest datapoint according to mouse coordinates
  yourData.forEach(function(d) {
    if (Math.abs(d3.timeDay.count(d.date, date)) < 45){
      d.value = value;
      d.defined = true;
    }
  });

  // adjust the height of the rectangles according to the new data
  g.selectAll(".your-bar")
    .filter(function(d) { return d.defined; })
    .attr("cy", function(d) { return y(d.value); })
    .attr("r", barWidth / 2);

  // if user has drawn the whole curve, activate the show-button
  if (d3.mean(yourData, function(d) { return d.defined; }) == 1){
    showButton.classed("button-active", true).on("click", showCorrectPath);
    showButtonText.classed("active", true).on("click", showCorrectPath);
  }

}));

// REMOVE THE CLIPPING RECTANGLE AND DISABLE DRAGGING BEHAVIOR
function showCorrectPath() {
  clipRect.transition().duration(1000).attr('width', width);
  svg.call(d3.drag().on('drag', null));
  d3.select(".debriefing").classed("unblur", true);
}
