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

// chart padding values
var CHART_BOTTOM_PADDING = 40;
var CHART_TOP_PADDING = 30;
var CHART_LEFT_PADDING = 40;
var CHART_RIGHT_PADDING = 20;

// approximate number of ticks on the WAR axis
var WAR_TICKS = 7;

// line width, color, and fill
var LINE_WIDTH = 0;
var FIP_WAR_COLOR = '#0000ff';
var RA9_WAR_COLOR = '#ff0000';
var FIP_WAR_FILL = 'rgba(0, 0, 256, 0.75)';
var RA9_WAR_FILL = 'rgba(256, 0, 0, 0.75)';

// Text sizing
var CHART_TITLE_SIZE = 20; // set in the .chart-title class
var AXIS_TITLE_SIZE = 15;  // set in the .axis-title class
var CHAMP_SIZE = 10;       // set in the .champ-note class

// Text padding
var AXIS_BOTTOM_PADDING = 20; // accounts for axis size and spacing
var AXIS_LEFT_PADDING = 25;   // accounts for axis size and spacing
var CHAMP_INTERIOR_PADDING = 1;

// champion stats
var CHAMP_STATS = ['W', 'ERA', 'CG', 'SHO', 'IP', 'SO', 'FIP', 'WHIP'];

// WAR note attributes
var WAR_SIZE = 10;
var WAR_RIGHT_PADDING = 80;
var WAR_TOP_PADDING = 5;
var WAR_INTERIOR_PADDING = 3;

// ---------------------------------------- Visualization

// create a graph for each pitcher
$.each(pitcherDataProcessed, function(index, pitcherData) {
	// -------------------- Initialization
	// initialize a SVG container, retain for easier future access
	var svg = d3.select('body')
				.append('svg')
				.attr('width', WIDTH)
				.attr('height', HEIGHT);

	// -------------------- Scales
	// a scale for WAR from 0 to the highest WAR value
	var warScale = d3.scale.linear()
					 .domain([0, d3.max(pitcherData.records, function(d) {
					 	return d.WARfip > d.WARra9 ? d.WARfip : d.WARra9;
					 })])
					 .range([HEIGHT - CHART_BOTTOM_PADDING, CHART_TOP_PADDING]);

	// a scale for the years spanning the full set of years
	var yearScale = d3.scale.linear()
					  .domain([d3.min(pitcherData.records, function(d) { return d.year; }),
					  		d3.max(pitcherData.records, function(d) { return d.year; })])
					  .range([CHART_LEFT_PADDING, WIDTH - CHART_RIGHT_PADDING]);

	// -------------------- Line graphs
	// returns the results of a line function for both types of WAR
	function warGraph(WAR) {
		// get the simple line -- time plot, no shading
		var line = d3.svg.line().x(function(d) { return yearScale(d.year); })
								.y(function(d) { return warScale(d[WAR]); })
								.interpolate('linear')(pitcherData.records);

		// complete the line
		// add a point at the bottom right of the chart
		line += 'L' + (WIDTH - CHART_RIGHT_PADDING) + ',' + (HEIGHT - CHART_BOTTOM_PADDING);
		// add a point at the bottom left of the chart
		line += 'L' + CHART_LEFT_PADDING + ',' + (HEIGHT - CHART_BOTTOM_PADDING);
		// return to the first point in the d3-generated line
		line += 'Z';

		return line;
	}

	// draw RA9 WAR line
	svg.append('path')
		.attr('d', warGraph('WARra9'))
		.attr('stroke', RA9_WAR_COLOR)
		.attr('stroke-width', LINE_WIDTH)
		.attr('fill', RA9_WAR_FILL);

	// draw FIP WAR line
	svg.append('path')
		.attr('d', warGraph('WARfip'))
		.attr('stroke', FIP_WAR_COLOR)
		.attr('stroke-width', LINE_WIDTH)
		.attr('fill', FIP_WAR_FILL);

	// -------------------- Axes
	// horizontal year axis
	svg.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(0,' + (HEIGHT - CHART_BOTTOM_PADDING) + ')')
		.call(d3.svg.axis()
					.scale(yearScale)
					.orient('bottom')
					.ticks(pitcherData.records.length / 2) // every other year
					.tickFormat(d3.format('d')));

	// vertical WAR axis
	svg.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(' + CHART_LEFT_PADDING +',0)')
		.call(d3.svg.axis()
					.scale(warScale)
					.orient('left')
					.ticks(WAR_TICKS));

	// -------------------- Axis Titles
	// helper function to center objects horizontally
	function centerObj(obj, isHorizontal) {
		if (isHorizontal) {
			obj.attr('x', (WIDTH - $(obj[0][0]).width()) / 2);
		} else {
			obj.attr('x', -(HEIGHT + $(obj[0][0]).width()) / 2);
		}
	}

	// horizontal year axis title
	var yearAxisTitle = svg.append('text')
							.attr('class', 'axis-title')
							.attr('y', HEIGHT - CHART_BOTTOM_PADDING +
								AXIS_TITLE_SIZE + AXIS_BOTTOM_PADDING)
							.text('Year');

	// center the horizontal axis title
	centerObj(yearAxisTitle, true);

	// vertical WAR axis title
	var warAxisTitle = svg.append('text')
							.attr('class', 'axis-title vert-text')
							.attr('x', -HEIGHT / 2)
							.attr('y', CHART_LEFT_PADDING - AXIS_LEFT_PADDING)
							.text('WAR');

	// center the vertical axis title
	centerObj(warAxisTitle, false);

	// -------------------- Chart Title
	var chartTitle = svg.append('text')
						.attr('class', 'chart-title')
						.attr('y', CHART_TITLE_SIZE)
						.text(pitcherData.name)

	// center the title
	centerObj(chartTitle, true);

	// -------------------- Champ stats and year lines
	$.each(pitcherData.records, function(index, record) {
		// initial value of y -- directly above the highest WAR for that year
		var y = warScale(Math.max(record.WARra9, record.WARfip));
		$.each(CHAMP_STATS, function(index, stat) {
			// if the pitcher was the champion of this stat for this year
			if(record[stat + 'champ']) {
				// adjust y for the next stat -- first directly below highest WAR
				y += CHAMP_SIZE + CHAMP_INTERIOR_PADDING;

				// add a note to indicate they were that stats' champion
				var champNote = svg.append('text')
									.attr('class', 'champ-note')
									.attr('x', yearScale(record.year))
									.attr('y', y)
									.text(stat);

				// adjust x position to center notes on the year
				champNote.attr('x', champNote.attr('x') - $(champNote[0][0]).width() / 2);
			}

		});

		// add a vertical line for each year
		svg.append('line')
			.attr('class', 'year-line')
			.attr('x1', yearScale(record.year))
			.attr('y1', warScale(Math.min(0, record.WARra9, record.WARfip)))
			.attr('x2', yearScale(record.year))
			.attr('y2', warScale(Math.max(record.WARra9, record.WARfip)));
	});

	// -------------------- Career WAR totals
	// helper function to get career WAR of either type
	function getCareerWar(records, type) {
		return Math.round(d3.sum(records, function(d) { return d[type]; }) * 10) / 10;
	}

	svg.append('text')
		.attr('class', 'war-text ra9-war')
		.attr('x', WIDTH - WAR_RIGHT_PADDING)
		.attr('y', WAR_TOP_PADDING + WAR_SIZE)
		.text('RA9 WAR: ' + getCareerWar(pitcherData.records, 'WARra9'));

	svg.append('text')
		.attr('class', 'war-text fip-war')
		.attr('x', WIDTH - WAR_RIGHT_PADDING)
		.attr('y', WAR_TOP_PADDING + 2 * WAR_SIZE + WAR_INTERIOR_PADDING)
		.text('FIP WAR: ' + getCareerWar(pitcherData.records, 'WARfip'));

});
