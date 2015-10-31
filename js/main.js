/* main.js
 * Eli Shayer
 * -------
 * The current JavaScript file for the SSAC entry to the
 * majorleaguedatachallenge.com visualization contest.
 * Visualizes the careers of the top 10 batters and top 10
 * hitters in MLB history using the d3.js library.
 */

// ---------------------------------------- Constants

// SVG size
var WIDTH = 500;
var HEIGHT = 200;

// padding values
var VERTICAL_PADDING = 40;
var HORIZONTAL_PADDING = 20;

// approximate number of ticks on the WAR axis
var WAR_TICKS = 7;

// line specifications
var LINE_WIDTH = 2;
var FIP_WAR_COLOR = 'blue';
var RA9_WAR_COLOR = 'red';

// ---------------------------------------- Visualization

// for each pitcher
for (var i = 0; i < pitcherDataProcessed.length; i++) {
	// -------------------- Initialization
	// initialize a SVG container, retain in a variable for easier future access
	var svg = d3.select('body')
				.append('svg')
				.attr('width', WIDTH)
				.attr('height', HEIGHT);

	// -------------------- Scales
	// a scale for WAR from 0 to the highest WAR value
	var warScale = d3.scale.linear()
					 .domain([0, d3.max(pitcherDataProcessed[i].records, function(d) { return d.WARfip > d.WARra9 ? d.WARfip : d.WARra9; })])
					 .range([HEIGHT - VERTICAL_PADDING, VERTICAL_PADDING]);

	// a scale for the years spanning the full set of years
	var yearScale = d3.scale.linear()
					  .domain([d3.min(pitcherDataProcessed[i].records, function(d) { return d.year; }), d3.max(pitcherDataProcessed[i].records, function(d) { return d.year; })])
					  .range([HORIZONTAL_PADDING, WIDTH - HORIZONTAL_PADDING]);

	// -------------------- Line graphs
	// function to return the results of a line function for both types of WAR, as determined by the parameter
	function warGraph(WAR) {
		return d3.svg.line().x(function(d) { return yearScale(d.year); })
							.y(function(d) { return warScale(d[WAR]); })
							.interpolate('linear')(pitcherDataProcessed[i].records);
	}

	// draw FIP WAR line
	svg.append('path')
		.attr('d', warGraph('WARfip'))
		.attr('stroke', FIP_WAR_COLOR)
		.attr('stroke-width', LINE_WIDTH)
		.attr('fill', 'none');

	// draw RA9 WAR line
	svg.append('path')
		.attr('d', warGraph('WARra9'))
		.attr('stroke', RA9_WAR_COLOR)
		.attr('stroke-width', LINE_WIDTH)
		.attr('fill', 'none');

	// -------------------- Axes
	// horizontal year axis
	var yearAxis = d3.svg.axis()
							.scale(yearScale)
							.orient('bottom')
							.ticks(pitcherDataProcessed[i].records.length / 2) // ticks every other year
							.tickFormat(d3.format('d'));

	svg.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(0,' + (HEIGHT - VERTICAL_PADDING) + ')')
		.call(yearAxis);

	// vertical WAR axis
	var warAxis = d3.svg.axis()
						.scale(warScale)
						.orient('left')
						.ticks(WAR_TICKS);

	svg.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(' + HORIZONTAL_PADDING +',0)')
		.call(warAxis);
}
