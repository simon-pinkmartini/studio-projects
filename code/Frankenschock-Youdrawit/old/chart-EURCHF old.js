// BASIC ELEMENTS OF THE GRAPH ACCORDING TO CONVENTIONS
var svg = d3.select("svg"),
    margin = {top: 80, right: 40, bottom: 80, left: 40},
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

// - The rectangle used to clip the initial line and the <g> fot the line itself
var clipRect = g.append('clipPath')
                .attr('id', 'clip');

var clipRectRect = clipRect.append('rect')
                           .attr('width', 1)
                           .attr('height', height);

var correctSel = g.append('g').attr('clip-path', 'url(#clip)');

// - The <g> used for the user-drawn line
var yourDataSel = g.append('path').attr('class', 'your-line');

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
                            .attr('class', 'button-text').text('Kurs anzeigen');

// FUNCTIONAL VARIABLES
var cutoffMoment = '2014-12-15';
var yourData = [];

// AXES
var x = d3.scaleTime().range([0, width]),
    y = d3.scaleLinear().range([height, 0]),
    z = d3.scaleOrdinal(d3.schemeCategory10);

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
  //for (var i = 1, n = columns.length, c; i < n; ++i) d[c = columns[i]] = +d[c];
  //d.value = d.value;
  return d;
}

// LOAD THE DATA AND DRAW THE LINES - BEFORE USER INTERACTION
d3.csv("data-EURCHF.csv", type, function(error, data) {
  if (error) throw error;

  // container for the loaded data
  var curves = data.columns.slice(1).map(function(id) {
    return {
      id: id,
      values: data.map(function(d) {
        return {date: d.date, value: d[id]};
      })
    };
  });

  // container for the user data, initially has correct values but is invisible
  yourData = {
    id: 'yourdata',
    values: data.map(function(d) { return {date: d.date, value: d.value, defined: 0} })
                .filter(function(d) {
                  if (d.date == parseTime(cutoffMoment)) {d.defined = true };
                  return d.date >= parseTime(cutoffMoment);
                  })
  };

  // adjust the scales according to the data (x-axis)
  x.domain(d3.extent(data, function(d) { return d.date; }));
  y.domain([1, 1.3]);

  //z.domain(curves.map(function(c) { return c.id; }));

  // generate the Axes
  gXaxis = g.append("g")
            .attr("class", "axis axis--x")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x).ticks(d3.timeYear).tickSize(height * (-1)))
            .selectAll(".tick text").attr("dy", 16).attr("dx", 16);

  gYaxis = g.append("g")
            .attr("class", "axis axis--y")
            .call(d3.axisLeft(y).ticks(6).tickSize(width * (-1)))
            .selectAll(".tick text").attr("dx", -5);

  // adjust the clipping rectangle according to the data
  clipRectRect.attr('width', x(parseTime(cutoffMoment)));

  // generate the curve for the actual line
  var curve = correctSel.selectAll(".curve")
                        .data(curves)
                        .enter().append("g")
                                .attr("class", "curve").append("path")
                                                       .attr("class", "line")
                                                       .attr("d", function(d) { return line(d.values); });
  // add a circle at the cutoff-Moment
  g.append("circle")
   .attr("cx", x(yourData.values[0].date))
   .attr("cy", y(yourData.values[0].value))
   .attr("r", 8)
   .attr("class", "circle");

});

// IMIPLEMENT THE USER DRAWING FUNCTION
svg.call(d3.drag().on('drag', function() {

  // we are saving the cutoff-date for later
  var cutoffDate = yourData.values[0].date;
  var cutoffValue = yourData.values[0].value;

  // transform current mouse pointer from svg-coordinates into domain-related coordinates
  var pos = d3.mouse(this);
  var date = clamp(parseTime(cutoffMoment), x.domain()[1], x.invert(pos[0] - margin.left));
  var value = clamp(y.domain()[0], y.domain()[1], y.invert(pos[1] - margin.top));

  // if mouse drag event happens, modify the nearest datapoint according to mouse coordinates
  yourData.values.forEach(function(d) {
    if (Math.abs(d3.timeDay.count(d.date, date)) < 15){
      d.value = value;
      d.defined = true;
    }
  });

  // make sure the first point always starts from the initial value at cutoff-point
  yourData.values[0].date = cutoffDate;
  yourData.values[0].value = cutoffValue;

  // now, draw the user-defined line (only for point where mousedrag has already happened)
  yourDataSel.attr('d', line.defined( function(d) { return d.defined; } )(yourData.values));

  // if user has drawn the whole curve, activate the show-button
  if (d3.mean(yourData.values, function(d) { return d.defined; }) == 1){
    showButton.classed("button-active", true).on("click", showCorrectSel);
    showButtonText.classed("active", true).on("click", showCorrectSel);
  }

}));

// REMOVE THE CLIPPING RECTANGLE AND DISABLE DRAGGING BEHAVIOR
function showCorrectSel() {
  clipRectRect.transition().duration(1000).attr('width', width);
  svg.call(d3.drag().on('drag', null));
}
