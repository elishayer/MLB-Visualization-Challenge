/* visualize.js
 * Eli Shayer
 * -------
 * The current JavaScript file for the SSAC entry to the
 * majorleaguedatachallenge.com visualization contest.
 * Visualizes the careers of the top 10 batters and top 10
 * hitters in MLB history using the d3.js library.
 */

// ======================================== Constants

// Chart SVG size
var CHART_WIDTH = 400;
var CHART_HEIGHT = 250;

// chart padding values
var CHART_BOTTOM_PADDING = 100;
var CHART_TOP_PADDING = 30;
var CHART_LEFT_PADDING = 130;
var CHART_RIGHT_PADDING = 20;

// approximate number of ticks on the WAR axis
var WAR_TICKS = 7;

// line width, color, and fill
var LINE_WIDTH = 2;
var FIP_WAR_COLOR = '#0000ff';
var RA9_WAR_COLOR = '#ff0000';
var FIP_WAR_FILL = 'rgba(0, 0, 256, 0.75)';
var RA9_WAR_FILL = 'rgba(256, 0, 0, 0.75)';

// Text sizing
var CHART_TITLE_SIZE = 20; // set in the .chart-title class
var AXIS_TITLE_SIZE = 15;  // set in the .axis-title class
var CHAMP_SIZE = 8;        // set in the .champ-note class

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

// image location and size
var IMAGE_X = 10;
var IMAGE_Y = 10;
var IMAGE_WIDTH = 80;
var IMAGE_HEIGHT = 100;

// Award names and specifications
var AWARDS = [{name: 'All Star', key: 'as'}, {name: 'World Series', key: 'ws'},
	{name: 'Gold Glove', key: 'gg'}, {name: 'MVP', key: 'mvp'}, {name: 'Cy Young', key: 'cy'}];
var AWARD_BASE_Y = CHART_HEIGHT - CHART_BOTTOM_PADDING + AXIS_TITLE_SIZE + AXIS_BOTTOM_PADDING + 10;
var AWARD_BASE_X = CHART_LEFT_PADDING - 5;
var AWARD_SIZE = 10;
var AWARD_INTERIOR_PADDING = 2;
var AWARD_RADIUS = 3;

// Legend constants
var LEGEND_WIDTH = 200;
var LEGEND_HEIGHT = 250;

// Polygon SVG size
var POLY_WIDTH = 250;
var POLY_HEIGHT = 250;

// Polygon parameters
var POLY_SIDES = 6;
var POLY_D_RADIUS = 10;
var NUM_POLY = 10;
var POLY_AVERAGE = Math.round(NUM_POLY / 2);

// Polygon colors and stroke width
var POLY_COLOR_DEFAULT = '#000000'; // black
var POLY_COLOR_AVERAGE = '#0000ff'; // blue
var POLY_COLOR_LEADER = '#ff0000';  // red

var POLY_STROKE_DEFAULT = 1;
var POLY_STROKE_THICK = 2;

// Polygon stats
var POLY_STATS_BASIC = ['W', 'ERA', 'AVG', 'SO', 'IP', 'FP'];
var POLY_STATS_ADV = ['KBB', 'HR9', 'BABIP', 'FIP', 'TBF', 'TZ'];

var POLY_SKILLS_TEST = [{name: 'Wins', key: 'W'}, {name: 'ERA', key: 'ERA'}, 
	{name: 'Strikeouts', key: 'SO'}, {name: 'IP', key: 'IP'},
	{name: 'FIP', key: 'FIP'}, {name: 'HR/9', key: 'HR9'}];

// ======================================== Visualization

// ======================================== Chart
// -------------------- WAR Scale
// a scale for WAR from 0 to the highest WAR value
// same scale is used for all pitchers to improve ability to compare
var warScale = d3.scale.linear()
				 .domain([0, d3.max(pitcherDataProcessed, function(pitcherData) {
				 	// the highest of all WARs of all pitchers
				 	return d3.max(pitcherData.records, function(d) {
				 		// the highest of all WARs for all years, and higher of RA9/FIP
				 		return Math.max(d.WARfip, d.WARra9);
				 	})
				 })])
				 .range([CHART_HEIGHT - CHART_BOTTOM_PADDING, CHART_TOP_PADDING]);

// create a graph for each pitcher
$.each(pitcherDataProcessed, function(index, pitcherData) {
	// -------------------- Initialization
	// initialize a SVG container, retain for easier future access
	var svg = d3.select('body')
				.append('svg')
				.attr('width', CHART_WIDTH)
				.attr('height', CHART_HEIGHT);

	// -------------------- Year Scale
	// a scale for the years spanning the full set of years
	var yearScale = d3.scale.linear()
					  .domain([d3.min(pitcherData.records, function(d) { return d.year; }),
					  		d3.max(pitcherData.records, function(d) { return d.year; })])
					  .range([CHART_LEFT_PADDING, CHART_WIDTH - CHART_RIGHT_PADDING]);

	// -------------------- Line graphs
	// returns the results of a line function for both types of WAR
	function warGraph(WAR) {
		// get the simple line -- time plot, no shading
		var line = d3.svg.line().x(function(d) { return yearScale(d.year); })
								.y(function(d) { return warScale(d[WAR]); })
								.interpolate('linear')(pitcherData.records);
/*
		// complete the line
		// add a point at the bottom right of the chart
		line += 'L' + (CHART_WIDTH - CHART_RIGHT_PADDING) + ',' + (CHART_HEIGHT - CHART_BOTTOM_PADDING);
		// add a point at the bottom left of the chart
		line += 'L' + CHART_LEFT_PADDING + ',' + (CHART_HEIGHT - CHART_BOTTOM_PADDING);
		// return to the first point in the d3-generated line
		line += 'Z';
*/
		return line;
	}

	// draw RA9 WAR line
	svg.append('path')
		.attr('d', warGraph('WARra9'))
		.attr('stroke', RA9_WAR_COLOR)
		.attr('stroke-width', LINE_WIDTH)
		.attr('fill', 'none');

	// draw FIP WAR line
	svg.append('path')
		.attr('d', warGraph('WARfip'))
		.attr('stroke', FIP_WAR_COLOR)
		.attr('stroke-width', 2)
		.attr('fill', 'none');

	// -------------------- Axes
	// horizontal year axis
	svg.append('g')
		.attr('class', 'axis')
		.attr('transform', 'translate(0,' + (CHART_HEIGHT - CHART_BOTTOM_PADDING) + ')')
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
			obj.attr('x', (CHART_WIDTH - $(obj[0][0]).width()) / 2);
		} else {
			obj.attr('x', -(CHART_HEIGHT + $(obj[0][0]).width()) / 2);
		}
	}

	// horizontal year axis title
	var yearAxisTitle = svg.append('text')
							.attr('class', 'axis-title')
							.attr('y', CHART_HEIGHT - CHART_BOTTOM_PADDING +
								AXIS_TITLE_SIZE + AXIS_BOTTOM_PADDING)
							.text('Year');

	// center the horizontal axis title
	centerObj(yearAxisTitle, true);

	// vertical WAR axis title
	var warAxisTitle = svg.append('text')
							.attr('class', 'axis-title vert-text')
							.attr('x', -CHART_HEIGHT / 2)
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
	});

	// -------------------- Career WAR totals
	// helper function to get career WAR of either type
	function getCareerWar(records, type) {
		return Math.round(d3.sum(records, function(d) { return d[type]; }) * 10) / 10;
	}

	svg.append('text')
		.attr('class', 'war-text ra9-war')
		.attr('x', CHART_WIDTH - WAR_RIGHT_PADDING)
		.attr('y', WAR_TOP_PADDING + WAR_SIZE)
		.text('RA9 WAR: ' + getCareerWar(pitcherData.records, 'WARra9'));

	svg.append('text')
		.attr('class', 'war-text fip-war')
		.attr('x', CHART_WIDTH - WAR_RIGHT_PADDING)
		.attr('y', WAR_TOP_PADDING + 2 * WAR_SIZE + WAR_INTERIOR_PADDING)
		.text('FIP WAR: ' + getCareerWar(pitcherData.records, 'WARfip'));

	// -------------------- Player images
	svg.append('image')
		.attr('xlink:href', './images/pitchers/' + pitcherData.name.replace(' ', '_') + '.jpg')
		.attr('x', IMAGE_X)
		.attr('y', IMAGE_Y)
		.attr('width', IMAGE_WIDTH)
		.attr('height', IMAGE_HEIGHT);

	// -------------------- Awards
	// the height of the current horizontal award line
	var yAward = AWARD_BASE_Y + AWARD_INTERIOR_PADDING;

	// for each award
	$.each(AWARDS, function(index, award) {
		// add a label
		var awardLabel = svg.append('text')
							.attr('class', 'award-text')
							.attr('x', AWARD_BASE_X)
							.attr('y', yAward)
							.text(award.name + ':');

		// adjust label backwards such that colons line up
		awardLabel.attr('x', awardLabel.attr('x') - $(awardLabel[0][0]).width());

		// for each year
		$.each(pitcherData.records, function(index, record) {
			var isWon = record[award.key];

			// draw a circle if the award is won, otherwise a dot
			// TODO: turn these into appropriate icons
			svg.append('circle')
				.attr('cx', yearScale(record.year))
				.attr('cy', yAward - AWARD_SIZE / 3)
				.attr('r', isWon ? AWARD_RADIUS : 1)
		});

		// update yAward for the next award
		yAward += AWARD_SIZE + AWARD_INTERIOR_PADDING;
	});

	// ======================================== Polygon
	// create a svg for the polygon
	var polySvg = d3.select('body')
				.append('svg')
				.attr('width', POLY_WIDTH)
				.attr('height', POLY_HEIGHT);

	// helper function to get x coordinate
	function getX(radius, angle) {
		return POLY_WIDTH / 2 + radius * Math.cos(angle);
	}

	// helper function to get y coordinate
	function getY(radius, angle) {
		return POLY_HEIGHT / 2 + radius * Math.sin(angle);
	}

	// helper function to add a point to a path
	function pathPt(radius, angle) {
		return 'L' + getX(radius, angle) + ',' + getY(radius, angle);
	}

	// helper function for a SVG polygon path
	function polygonPath(sides, radius) {
		var path = '';
		// radians per side given the number of sides
		var dRadians = 2 * Math.PI / sides;

		// the current angle, negative so that
		var angle = -Math.PI / 2;
		for (var i = 0; i < sides; i++) {
			path += pathPt(radius, angle);
			angle += dRadians;
		}
		return 'M' + path.substring(1) + 'Z';
	}

	// helper function to draw a polygon
	function drawRegularPolygon(sides, radius, color, strokeWidth) {
		polySvg.append('path')
				.attr('d', polygonPath(sides, radius))
				.attr('stroke', color)
				.attr('stroke-width', strokeWidth)
				.attr('fill', 'none');
	}

	// helper function to draw a skill polygon
	function drawSkillPolygon(skills, record) {
		var path = '';
		var dRadians = 2 * Math.PI / POLY_SIDES;

		// straight upwards
		var angle = -Math.PI / 2;

		// maximum radius, to edge of polygon
		var radius = NUM_POLY * POLY_D_RADIUS;

		$.each(skills, function(index, skill) {
			var scale = d3.scale.linear()
								.domain([record[skill.key + 'mean'], record[skill.key + 'best']])
								.range([radius / 2, radius]);

			// insure that no radii are negative
			path += pathPt(Math.max(scale(record[skill.key]), 0), angle);

			// add skill labels
			polySvg.append('text')
					.attr('class', 'poly-label')
					.attr('x', getX(radius, angle))
					.attr('y', getY(radius, angle))
					.text(skill.name);

			// update the angle for the next skill
			angle += dRadians;
		});

		// draw the skills polygon with the generate path
		// TODO: constant the stroke width, color, fill
		polySvg.append('path')
				.attr('d', 'M' + path.substring(1) + 'Z')
				.attr('stroke', 'black')
				.attr('stroke-width', 2)
				.attr('fill', 'rgba(0, 0, 0, 0.5)');
	}

	// draw the regular polygons
	for (var p = 0; p <= NUM_POLY; p++) {
		var color = POLY_COLOR_DEFAULT;
		var strokeWidth = POLY_STROKE_DEFAULT;
		if (p === NUM_POLY || p === NUM_POLY / 2) {
			color = (p === NUM_POLY ? POLY_COLOR_LEADER : POLY_COLOR_AVERAGE);
			strokeWidth = POLY_STROKE_THICK;
		}
		drawRegularPolygon(POLY_SIDES, p * POLY_D_RADIUS, color, strokeWidth);
	}

	// draw the skill polygon using test categories and first year of data
	drawSkillPolygon(POLY_SKILLS_TEST, pitcherData.records[0]);

});

// ======================================== Legend
// create an svg for the legend
var legend = d3.select('body')
				.append('svg')
				.attr('width', LEGEND_WIDTH)
				.attr('height', LEGEND_HEIGHT);

// legend title
var legendTitle = legend.append('text')
						.attr('class', 'legend-title')
						.attr('x', 0)
						.attr('y', 20)
						.text('Legend');

// center the legend title
legendTitle.attr('x', (LEGEND_WIDTH - $(legendTitle[0][0]).width()) / 2);

// RA9 WAR
// FIP WAR
// Stat champ
// Award



