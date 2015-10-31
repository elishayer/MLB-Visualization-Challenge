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


// ---------------------------------------- Data

// sample WAR data from Walter Johnson in JSON format
// TODO: convert .csv data to JSON data
var wjWARdata = [
	{
		year   : 1907,
		WARra9 : 2.7,
		WARfip : 2.2
	},
	{
		year   : 1908,
		WARra9 : 5.1,
		WARfip : 4.5
	},
	{
		year   : 1909,
		WARra9 : 4,
		WARfip : 3.5
	},
	{
		year   : 1910,
		WARra9 : 11.2,
		WARfip : 9.6
	},
	{
		year   : 1911,
		WARra9 : 8.5,
		WARfip : 5.9
	},
	{
		year   : 1912,
		WARra9 : 13.5,
		WARfip : 9.3
	},
	{
		year   : 1913,
		WARra9 : 14.6,
		WARfip : 8.5
	},
	{
		year   : 1914,
		WARra9 : 11.9,
		WARfip : 7.8
	},
	{
		year   : 1915,
		WARra9 : 11.2,
		WARfip : 8.2
	},
	{
		year   : 1916,
		WARra9 : 9.7,
		WARfip : 8.8
	},
	{
		year   : 1917,
		WARra9 : 6.8,
		WARfip : 6.7
	},
	{
		year   : 1918,
		WARra9 : 10.2,
		WARfip : 6.5
	},
	{
		year   : 1919,
		WARra9 : 10.5,
		WARfip : 6.8
	},
	{
		year   : 1920,
		WARra9 : 2.5,
		WARfip : 2.7
	},
	{
		year   : 1921,
		WARra9 : 4.8,
		WARfip : 4.5
	},
	{
		year   : 1922,
		WARra9 : 5.5,
		WARfip : 3.3
	},
	{
		year   : 1923,
		WARra9 : 4.6,
		WARfip : 3.8
	},
	{
		year   : 1924,
		WARra9 : 6.8,
		WARfip : 5.1
	},
	{
		year   : 1925,
		WARra9 : 5.1,
		WARfip : 3.9
	},
	{
		year   : 1926,
		WARra9 : 3.8,
		WARfip : 4.1
	},
	{
		year   : 1927,
		WARra9 : -0.4,
		WARfip : 1.3
	},
];


// ---------------------------------------- Visualization

// -------------------- Initialization
// initialize a SVG container, retain in a variable for easier future access
var svg = d3.select('body')
			.append('svg')
			.attr('width', WIDTH)
			.attr('height', HEIGHT);

// -------------------- Scales
// a scale for WAR from 0 to the highest WAR value
var warScale = d3.scale.linear()
				 .domain([0, d3.max(wjWARdata, function(d) { return d.WARfip > d.WARra9 ? d.WARfip : d.WARra9; })])
				 .range([HEIGHT - VERTICAL_PADDING, VERTICAL_PADDING]);

// a scale for the years spanning the full set of years
var yearScale = d3.scale.linear()
				  .domain([d3.min(wjWARdata, function(d) { return d.year; }), d3.max(wjWARdata, function(d) { return d.year; })])
				  .range([HORIZONTAL_PADDING, WIDTH - HORIZONTAL_PADDING]);

// -------------------- Line graphs
// function to return the results of a line function for both types of WAR, as determined by the parameter
function warGraph(WAR) {
	return d3.svg.line().x(function(d) { return yearScale(d.year); })
						.y(function(d) { return warScale(d[WAR]); })
						.interpolate('linear')(wjWARdata);
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
						.ticks(wjWARdata.length / 2) // ticks every other year
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
