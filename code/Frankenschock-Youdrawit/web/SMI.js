// SETUP THE GRAPH SIZE ACCORDING TO THE WINDOW THAT EMBEDS IT
var winWidth = window.innerWidth;
var svgWidth = winWidth - 10;
var svgHeight = winWidth * 0.7;
var size = 'normal';

if(winWidth <= 640) {
  size = 'small';
  d3.select(".title").style("display", "none");
  d3.select(".subtitle").style("display", "none");
  d3.select(".title-small").style("display", "inline");
  d3.select(".debriefing").classed("debriefing-small", true);
}
if (winWidth <= 460) {
  size = 'mini';
}

// INDIVIDUAL SETTINGS FOR THIS GRAPH
var datafile = "SMI.csv";
var cutoffMoment = '2014-12-15';
var yMinMax = [7000, 10000];


// BASIC ELEMENTS OF THE GRAPH ACCORDING TO CONVENTIONS
var svg = d3.select("svg").attr("width", svgWidth).attr("height", svgHeight),
    margin = {top: 20, right: 5, bottom: 30, left: 60},
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
                  .attr('clip-path', 'url(#clip)')
                    .append('path')
                    .attr('class', 'correct-line');

// - The <path> used for the user-drawn line
var yourPath = g.append('path')
                .attr('class', 'your-line');

// EMPTY CONTAINER FOR LATER
var yourData = [];

// AXES
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]);

// HELPER FUNCTIONS USED TO DEAL WITH TIME
var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%Y-%m-%d");

// HELPER FUNCTION TO GENERATE "d"-Attribute in <path>
var line = d3.line()
    .curve(d3.curveMonotoneX)
    .x(function(d) { return x(d.date); })
    .y(function(d) { return y(d.value); });

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
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain(yMinMax);

  // generate the Axes
  g.append("g")
    .attr("class", "axis axis--x")
    .attr("transform", "translate(0," + height + ")")
    .call(d3.axisBottom(x).ticks(d3.timeYear).tickSize(height * (-1)))
    .selectAll(".tick text").attr("dy", 16).attr("dx", 16);

  g.append("g")
    .attr("class", "axis axis--y")
    .call(d3.axisLeft(y).ticks(4).tickSize(width * (-1)).tickFormat(d3.format("")))
    .selectAll(".tick text").attr("dx", -5);

  // adjust the clipping rectangle according to the data
  clipRect.attr('width', x(parseTime(cutoffMoment)));

  // generate the curve for the actual line
  correctPath.attr("d", line(correctData));

// add a circle at the cutoff-Moment
  g.append("circle")
   .attr("cx", x(yourData[0].date))
   .attr("cy", y(yourData[0].value))
   .attr("r", 8)
   .attr("class", "circle");

});

// IMIPLEMENT THE USER DRAWING FUNCTION
svg.call(d3.drag().on('drag', function() {

  // we are saving the cutoff-date for later
  var cutoffDate = yourData[0].date;
  var cutoffValue = yourData[0].value;

  // transform current mouse pointer from svg-coordinates into domain-related coordinates
  var pos = d3.mouse(this);
  var date = clamp(parseTime(cutoffMoment), x.domain()[1], x.invert(pos[0] - margin.left));
  var value = clamp(y.domain()[0], y.domain()[1], y.invert(pos[1] - margin.top));

  // if mouse drag event happens, modify the nearest datapoint according to mouse coordinates
  yourData.forEach(function(d) {
    if (Math.abs(d3.timeDay.count(d.date, date)) < 15){
      d.value = value;
      d.defined = true;
    }
  });

  // make sure the first point always starts from the initial value at cutoff-point
  yourData[0].date = cutoffDate;
  yourData[0].value = cutoffValue;

  // now, draw the user-defined line (only for point where mousedrag has already happened)
  yourPath.attr('d', line.defined( function(d) { return d.defined; } )(yourData));

  // if user has drawn the whole curve, activate the show-button
  if (d3.mean(yourData, function(d) { return d.defined; }) == 1){
    d3.select(".button").classed("button-active", true).on("click", showCorrectPath);
  }

}));

// REMOVE THE CLIPPING RECTANGLE AND DISABLE DRAGGING BEHAVIOR
function showCorrectPath() {
  clipRect.transition().duration(1000).attr('width', width);
  svg.call(d3.drag().on('drag', null));
  if(size != 'mini') {
    d3.select(".debriefing").classed("unblur", true);
  }
  if(size == 'small') {
    d3.select(".button").style("display", "none");
  }
}
