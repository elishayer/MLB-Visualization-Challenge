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
var CHART_WIDTH = 550;
var CHART_HEIGHT = 250;

// chart padding values
var CHART_BOTTOM_PADDING = 100;
var CHART_TOP_PADDING = 30;
var CHART_LEFT_PADDING = 130;
var CHART_RIGHT_PADDING = 20;

// approximate number of ticks on the WAR axis
var WAR_TICKS = 7;

// WAR types and styles
var PITCHER_WAR = [
	{
		name: 'RA9 WAR',
		key: 'WARra9',
		class: 'ra9-war',
		color: '#ff0000'
	},
	{
		name: 'FIP WAR',
		key: 'WARfip',
		class: 'fip-war',
		color: '#0000ff'
	}
];
var HITTER_WAR = [
	{
		name: 'Run WAR',
		key: 'Value Running',
		class: 'run-war',
		color: '#00ff00'
	},
	{
		name: 'Hit WAR',
		key: 'Value Batting',
		class: 'bat-war',
		color: '#ff0000'
	},
	{
		name: 'Def WAR',
		key: 'Value Fielding',
		class: 'def-war',
		color: '#0000ff'
	},
];

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
var CHAMP_INTERIOR_PADDING = 2;

// champion stats
var PITCHER_CHAMP_STATS = ['W', 'ERA', 'CG', 'SHO', 'IP', 'SO', 'FIP', 'WHIP'];
var HITTER_CHAMP_STATS = ['AVG', 'HR', 'RBI', 'R', 'SB', 'FP', 'OBP', 'SLG'];

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
var PITCHER_AWARDS = [{name: 'All Star', key: 'as'}, {name: 'World Series', key: 'ws'},
	{name: 'Gold Glove', key: 'gg'}, {name: 'MVP', key: 'mvp'}, {name: 'Cy Young', key: 'cy'}];
var HITTER_AWARDS = [{name: 'All Star', key: 'as'}, {name: 'World Series', key: 'ws'},
	{name: 'Gold Glove', key: 'gg'}, {name: 'MVP', key: 'mvp'}];
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
var POLY_D_RADIUS = 8;
var NUM_POLY = 10;
var POLY_AVERAGE = Math.round(NUM_POLY / 2);

// Polygon colors and stroke width
var POLY_COLOR_DEFAULT = '#000000'; // black
var POLY_COLOR_AVERAGE = '#0000ff'; // blue
var POLY_COLOR_LEADER = '#ff0000';  // red
var POLY_STROKE_DEFAULT = 1;
var POLY_STROKE_THICK = 2;

// Skill poly color and stroke
var POLY_SKILL_STROKE_WIDTH = 2;
var POLY_SKILL_STROKE_COLOR = '#000000';
var POLY_SKILL_FILL_COLOR = 'rgba(0, 0, 0, 0.5)';

// Polygon stats
var PITCHER_STATS_BASIC = [{name: 'Wins', key: 'W'}, {name: 'ERA', key: 'ERA'},
	{name: 'BAA', key: 'AVG'}, {name: 'SO', key: 'SO'},
	{name: 'IP', key: 'IP'}, {name: 'FP', key: 'FP'}];
var PITCHER_STATS_ADV = [{name: 'K/BB', key: 'KBB'}, {name: 'HR/9', key: 'HR9'},
	{name: 'BABIP', key: 'BABIP'}, {name: 'FIP', key: 'FIP'},
	{name: 'TBF', key: 'TBF'}, {name: 'TZ', key: 'TZ'}];
var HITTER_STATS_BASIC = [{name: 'Average', key: 'AVG'}, {name: 'HR', key: 'HR'},
	{name: 'RBI', key: 'RBI'}, {name: 'Runs', key: 'R'},
	{name: 'SB', key: 'SB'}, {name: 'FP', key: 'FP'}];
var HITTER_STATS_ADV = [{name: 'OBP', key: 'OBP'}, {name: 'SLG', key: 'SLG'},
	{name: 'BsR', key: 'BSR'}, {name: 'BB/K', key: 'BBK'},
	{name: 'TZ', key: 'TZ'}, {name: 'BABIP', key: 'BABIP'}];

// Polygon label
var POLY_LABEL_PADDING = 3;
var POLY_LABEL_SIZE = 15;    // set in the .polygon-label class

// Polygon team image
var POLY_IMAGE_SIZE = 100;

var ZERO_EPSILON = 0.001 // zero with a bound

// variable for later transitions of skill polygons
var skillPolygons = {};

// ======================================== Visualization Function
function visualizeCareers(processedData, war, champ, awards, basic, advanced, isStacked) {
	// ======================================== Chart
	// -------------------- WAR Scale
	// a scale for WAR from 0 to the highest WAR value
	// same scale is used for all players to improve ability to compare
	var warScale = d3.scale.linear()
					 .domain([0, d3.max(processedData, function(playerData) {
					 	// the highest of all WARs of all players
					 	return d3.max(playerData.records, function(record) {
					 		// if stacked, sum over all types of WAR 
					 		if (isStacked) {
					 			var sum = 0;
					 			$.each(war, function(index, warType) {
					 				sum += record[warType.key];
					 			});
					 			return sum;
					 		// if not stacked, return the highest of all types
					 		} else {
					 			var max = 0; // assumes max is greater than 0, known to be true
					 			$.each(war, function(index, warType) {
					 				if (record[warType.key] > max) {
					 					max = record[warType.key];
					 				}
					 			});
					 			return max;
					 		}
					 	})
					 })])
					 .range([CHART_HEIGHT - CHART_BOTTOM_PADDING, CHART_TOP_PADDING]);

	// create a graph for each player
	$.each(processedData, function(index, playerData) {
		// -------------------- Initialization
		// initialize a SVG container, retain for easier future access
		var svg = d3.select('body')
					.append('svg')
					.attr('width', CHART_WIDTH)
					.attr('height', CHART_HEIGHT);

		// -------------------- Year Scale
		// a scale for the years spanning the full set of years
		var yearScale = d3.scale.linear()
						  .domain([d3.min(playerData.records, function(d) { return d.year; }),
						  		d3.max(playerData.records, function(d) { return d.year; })])
						  .range([CHART_LEFT_PADDING, CHART_WIDTH - CHART_RIGHT_PADDING]);

		// -------------------- Line graphs
		// returns the results of a line function for both types of WAR
		function warGraph(warArray, minIndex) {
			// get the simple line -- time plot, no shading
			var path =  d3.svg.line()
								.x(function(d) { return yearScale(d.year); })
								.y(function(d) {
									if (isStacked) {
										return warScale(d3.sum(warArray, function(war, index) {
											return index >= minIndex ? d[war.key] : 0;
										}));
									} else {
										return warScale(d[warArray[minIndex].key]);
									}
								})
								.interpolate('monotone')(playerData.records);
			if (isStacked) {
				// add a point at the bottom right of the chart
				path += 'L' + (CHART_WIDTH - CHART_RIGHT_PADDING) + ',' + (CHART_HEIGHT - CHART_BOTTOM_PADDING);
				// add a point at the bottom left of the chart
				path += 'L' + CHART_LEFT_PADDING + ',' + (CHART_HEIGHT - CHART_BOTTOM_PADDING);
				// return to the first point in the d3-generated line
				path += 'Z';
				return path;
			} else {
				return path;
			}
		}

		// an array of all WAR types up to this point
		// used differently depending on whether isStacked is true or false

		// draw a line on the chart for each type of war
		$.each(war, function(index, warType) {
			svg.append('path')
				.attr('d', warGraph(war, index))
				.attr('stroke', warType.color)
				.attr('stroke-width', LINE_WIDTH)
				.attr('fill', isStacked ? warType.color : 'none');
		});

		// -------------------- Axes
		// horizontal year axis
		svg.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(0,' + (CHART_HEIGHT - CHART_BOTTOM_PADDING) + ')')
			.call(d3.svg.axis()
						.scale(yearScale)
						.orient('bottom')
						.ticks(playerData.records.length / 3) // every third year
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
				obj.attr('x', (CHART_WIDTH - $(obj.node()).width()) / 2);
			} else {
				obj.attr('x', -(CHART_HEIGHT + $(obj.node()).width()) / 2);
			}
		}

		// horizontal year axis title
		var yearAxisTitle = svg.append('text')
								.attr('class', 'axis-title')
								.attr('y', CHART_HEIGHT - CHART_BOTTOM_PADDING +
									AXIS_TITLE_SIZE + AXIS_BOTTOM_PADDING)
								.text('Year');

		// center the horizontal axis title
		// TODO: make this center relative to the axis
		centerObj(yearAxisTitle, true);

		// vertical WAR axis title
		var warAxisTitle = svg.append('text')
								.attr('class', 'axis-title vert-text')
								.attr('x', -CHART_HEIGHT / 2)
								.attr('y', CHART_LEFT_PADDING - AXIS_LEFT_PADDING)
								.text('WAR');

		// center the vertical axis title
		// TODO: make this center relative to the axis
		centerObj(warAxisTitle, false);

		// -------------------- Chart Title
		var chartTitle = svg.append('text')
							.attr('class', 'chart-title')
							.attr('y', CHART_TITLE_SIZE)
							.text(playerData.name)

		// center the title
		centerObj(chartTitle, true);

		// -------------------- Champ stats and year lines
		$.each(playerData.records, function(index, record) {
			// initial value of y -- the bottom of the graph
			var y = warScale(0) - CHAMP_INTERIOR_PADDING;
			$.each(champ, function(index, stat) {
				// if the player was the champion of this stat for this year
				if(record[stat + 'champ']) {
					// add a note to indicate they were that stats' champion
					var champNote = svg.append('text')
										.attr('class', 'champ-note')
										.attr('x', yearScale(record.year))
										.attr('y', y)
										.text(stat);

					// adjust x position to center notes on the year
					champNote.attr('x', champNote.attr('x') - $(champNote.node()).width() / 2);

					// adjust y for the next stat
					y -= CHAMP_SIZE + CHAMP_INTERIOR_PADDING;
				}
			});
		});

		// -------------------- Career WAR totals
		// helper function to get career WAR of either type
		function getCareerWar(records, type) {
			// rounding to the nearest tenth
			return Math.round(d3.sum(records, function(d) { return d[type]; }) * 10) / 10;
		}

		var y = WAR_TOP_PADDING + WAR_SIZE;
		$.each(war, function(index, warType) {
			svg.append('text')
				.attr('class', 'war-text ' + warType.class)
				.attr('x', CHART_WIDTH - WAR_RIGHT_PADDING)
				.attr('y', WAR_TOP_PADDING + WAR_SIZE + index * (WAR_SIZE + WAR_INTERIOR_PADDING))
				.text(warType.name + ': ' + getCareerWar(playerData.records, warType.key));
		});

		// -------------------- Player images
		svg.append('image')
			.attr('xlink:href', './images/players/' + playerData.name.replace(' ', '_') + '.jpg')
			.attr('x', IMAGE_X)
			.attr('y', IMAGE_Y)
			.attr('width', IMAGE_WIDTH)
			.attr('height', IMAGE_HEIGHT);

		// -------------------- Awards
		// the height of the current horizontal award line
		var yAward = AWARD_BASE_Y + AWARD_INTERIOR_PADDING;

		// for each award
		$.each(awards, function(index, award) {
			// add a label
			var awardLabel = svg.append('text')
								.attr('class', 'award-text')
								.attr('x', AWARD_BASE_X)
								.attr('y', yAward)
								.text(award.name + ':');

			// adjust label backwards such that colons line up
			awardLabel.attr('x', awardLabel.attr('x') - $(awardLabel.node()).width());

			// for each year
			$.each(playerData.records, function(index, record) {
				var isWon = record[award.key] && record[award.key] != 'n/a';

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
			var maxR = NUM_POLY * POLY_D_RADIUS;

			$.each(skills, function(index, skill) {
				var scale = d3.scale.linear()
									.domain([record[skill.key + 'mean'], record[skill.key + 'best']])
									.range([maxR / 2, maxR]);

				// insure that all radii are in the range [0, maxR]
				path += pathPt(Math.min(Math.max(0, scale(record[skill.key])), maxR), angle);

				// add skill labels
				var polyLabel = polySvg.append('text')
										.attr('class', 'polygon-label')
										.attr('x', getX(maxR, angle))
										.attr('y', getY(maxR, angle))
										.text(skill.name);

				adjustPolyLabelLoc(polyLabel, angle);

				// update the angle for the next skill
				angle += dRadians;
			});

			// helper function to adjust the location of the polygon label
			function adjustPolyLabelLoc(label, angle) {
				// adjust x location

				// if label is on the left, move one width left and add padding
				if (Math.cos(angle) < -ZERO_EPSILON) {
					label.attr('x', label.attr('x') - $(label.node()).width() - POLY_LABEL_PADDING);

				// if label is on top/bottom, move half width left and add padding
				} else if (Math.abs(Math.cos(angle)) < ZERO_EPSILON) {
					label.attr('x', label.attr('x') - $(label.node()).width() / 2);
				
				// if label is on the left, add padding.
				// parseFloat to convert string to float, because .attr('y') returns string
				// and the + operator concatenates rather than adds
				} else {
					label.attr('x', parseFloat(label.attr('x')) + POLY_LABEL_PADDING);
				}

				// adjust y location

				// if label is on the top, add padding
				if (Math.sin(angle) < 0) {
					label.attr('y', label.attr('y') - POLY_LABEL_PADDING);

				// if label is on bottom, adjust by font size and add padding
				// same parseFloat rationale: convert from string to float to add rather than concatenate
				} else {
					label.attr('y', parseFloat(label.attr('y')) + POLY_LABEL_SIZE + POLY_LABEL_PADDING);
				}
			}

			// team colors, sourced from http://teamcolors.arc90.com/
			function getTeamColor(team) {
				switch(team) {
					case 'BOS': return '#c60c30';
					case 'CHC': return '#003279';
					case 'CHW': return '#c0c0c0';
					case 'CIN': return '#c6011f';
					case 'CLV': return '#d30335';
					case 'DET': return '#001742';
					case 'HOU': return '#072854';
					case 'LAA': return '#b71234';
					case 'LAD': return '#083c6b';
					case 'NYM': return '#002c77';
					case 'NYY': return '#1c2841';
					case 'PHI': return '#ba0c2f';
					case 'PIT': return '#fdb829';
					case 'SFG': return '#f2552c';
					case 'STL': return '#c41e3a';
					case 'TOR': return '#003da5';
					case 'WSH': return '#ba122b';
				}
			}


			// draw the skills polygon with color specified by the teams
			// TODO: put parameters in constants
			// TODO: convert to career by default
			return polySvg.append('path')
							.attr('d', 'M' + path.substring(1) + 'Z')
							.attr('stroke-width', 0)
							.attr('fill', getTeamColor(playerData.records[3].team))
							.attr('opacity', 0.6);
		}

		// add a key for the player to store the skill polygon for later access
		skillPolygons[playerData.name] = {
			image: polySvg.append('image')
							.attr('xlink:href', playerData.records[3].teamImage)
							.attr('x', (POLY_WIDTH - POLY_IMAGE_SIZE) / 2)
							.attr('y', (POLY_HEIGHT - POLY_IMAGE_SIZE) / 2)
							.attr('width', POLY_IMAGE_SIZE)
							.attr('height', POLY_IMAGE_SIZE)
		};

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
		skillPolygons[playerData.name].poly = drawSkillPolygon(basic, playerData.records[3]);

	});
/*
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
	legendTitle.attr('x', (LEGEND_WIDTH - $(legendTitle.node()).width()) / 2);

	// RA9 WAR
	// FIP WAR
	// Stat champ
	// Award
*/
}

visualizeCareers(processed.pitchers, PITCHER_WAR, PITCHER_CHAMP_STATS, PITCHER_AWARDS, PITCHER_STATS_BASIC, PITCHER_STATS_ADV, false);
visualizeCareers(processed.hitters, HITTER_WAR, HITTER_CHAMP_STATS, HITTER_AWARDS, HITTER_STATS_BASIC, HITTER_STATS_ADV, true);
