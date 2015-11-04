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
var CHART_WIDTH = 525;
var CHART_HEIGHT = 250;

// chart padding values
var CHART_BOTTOM_PADDING = 55;
var CHART_TOP_PADDING = 10;
var CHART_LEFT_PADDING = 130;
var CHART_RIGHT_PADDING = 20;

// approximate number of ticks on the WAR axis
var WAR_TICKS = 3;

// maximum WAR
var MAX_WAR = 15;

// dashed line style
var DASHED_STYLE = {"stroke-dasharray": ("3, 3")};

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
		color: '#551a8b',
		style: DASHED_STYLE
	}
];
var HITTER_WAR = [
	{
		name: 'Run WAR',
		key: 'Value Running',
		class: 'run-war',
		color: '#eee8aa'
	},
	{
		name: 'Hit WAR',
		key: 'Value Batting',
		class: 'bat-war',
		color: '#87cefa'
	},
	{
		name: 'Def WAR',
		key: 'Value Fielding',
		class: 'def-war',
		color: '#90ee90'
	},
];

// line width, color, and fill
var LINE_WIDTH = 2;
var FIP_WAR_COLOR = '#0000ff';
var RA9_WAR_COLOR = '#ff0000';
var FIP_WAR_FILL = 'rgba(0, 0, 256, 0.75)';
var RA9_WAR_FILL = 'rgba(256, 0, 0, 0.75)';

// Text sizing
var AXIS_TITLE_SIZE = 15;  // set in the .axis-title class
var CHAMP_SIZE = 7;        // set in the .champ-note class

// Text padding
var AXIS_LEFT_PADDING = 25;   // accounts for axis size and spacing

// champion stats
var PITCHER_CHAMP_STATS = ['W', 'ERA', 'SO', 'IP', 'SHO', 'FIP'];
var HITTER_CHAMP_STATS = ['HR', 'AVG', 'RBI', 'SB', 'OBP', 'R'];

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
var PITCHER_AWARDS = [{name: 'AS', key: 'as'}, {name: 'CY', key: 'cy'},
	{name: 'MVP', key: 'mvp'}, {name: 'WS', key: 'ws'}];
var HITTER_AWARDS = [{name: 'GG', key: 'gg'}, {name: 'AS', key: 'as'},
	{name: 'MVP', key: 'mvp'}, {name: 'WS', key: 'ws'}];
var AWARD_BASE_Y = CHART_HEIGHT - CHART_BOTTOM_PADDING + 15;
var AWARD_BASE_X = CHART_LEFT_PADDING - 5;
var AWARD_SIZE = 10;
var AWARD_INTERIOR_PADDING = 2;
var AWARD_RADIUS = 3;
var WS_ICON_SIZE = 35;

// Legend constants
var LEGEND_WIDTH = 200;
var LEGEND_HEIGHT = 250;

// Polygon SVG size
var POLY_WIDTH = 200;
var POLY_HEIGHT = 250;

// Polygon title parameters
var POLY_TITLE_TOP_PADDING = 10;
var POLY_TITLE_SIZE = 18;     // set in the .polygon-title class

// Polygon parameters
var POLY_SIDES = 6;
var POLY_D_RADIUS = 9;
var NUM_POLY = 8;
var POLY_AVERAGE = Math.round(NUM_POLY / 2);

// Polygon colors and stroke width
var POLY_COLOR_DEFAULT = '#000000'; // black
var POLY_COLOR_AVERAGE = '#0000ff'; // blue
var POLY_COLOR_LEADER = '#ff0000';  // red
var POLY_STROKE_DEFAULT = 1;
var POLY_STROKE_THICK = 2;

// Skill poly color and stroke
var POLY_SKILL_STROKE = '#000000';
var POLY_SKILL_STROKE_WIDTH = 3;
var POLY_SKILL_OPACITY = 0.7;

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

// ======================================== Setup DOM

// initialize a bootstrap container then a main row
var mainRow = d3.select('body')
				.append('div')
				.attr('class', 'container')
				.append('div')
				.attr('class', 'row');

// Overview for the project
mainRow.append('h1').text('Title');
mainRow.append('p').text('This is where we explain the entry');

// create two children from the main row: visualizations and navigation
var visCol = mainRow.append('div').attr('class', 'col-xs-10').attr('id', 'vis');
var navCol = mainRow.append('div').attr('class', 'col-xs-2').attr('id', 'nav');


// ======================================== Visualization Function
function visualizeCareers(processedData, playerType, war, champ, age, awards, basic, advanced, isStacked) {
	// ======================================== Category
	// append a header naming the player category
	visCol.append('h2')
			.attr('class', 'player-category')
			.attr('id', playerType + '-vis')
			.text(playerType);

	// ======================================== Chart
	// -------------------- WAR Scale
	// a scale for WAR from 0 to the highest WAR value
	// same scale is used for all players to improve ability to compare
	var warScale = d3.scale.linear()
					 .domain([0, MAX_WAR])
					 .range([CHART_HEIGHT - CHART_BOTTOM_PADDING, CHART_TOP_PADDING]);

	// -------------------- Year Scale
	// a scale for the years spanning the set of ages for the type of player
	var ageScale = d3.scale.linear()
					  .domain([age.min, age.max])
					  .range([CHART_LEFT_PADDING, CHART_WIDTH - CHART_RIGHT_PADDING]);
	// create a graph for each player
	$.each(processedData, function(index, playerData) {
		// initalize a bootsrap row to hold all the relevant elements
		var row = visCol.append('div')
						.attr('id', playerData.id)
						.attr('class', 'row player-vis');

		// add a title corresponding to the player name
		row.append('h3')
			.attr('class', 'player-title')
			.text(playerData.name + ' (' + playerData.minYear + ' - ' + playerData.maxYear + ')');

		// -------------------- Initialization
		// initialize a SVG container, retain for easier future access
		var svg = row.append('div')
						.attr('class', 'col-xs-12 col-sm-7')
						.append('svg')
						.attr('width', CHART_WIDTH)
						.attr('height', CHART_HEIGHT);

		// -------------------- Line graphs
		// returns the results of a line function for both types of WAR
		function warGraph(warArray, minIndex) {
			// get the simple line -- time plot, no shading
			var path =  d3.svg.line()
								.x(function(d) { return ageScale(d.age); })
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
				// get the simple line -- time plot, no shading
/*				var path =  d3.svg.line()
									.x(function(d) { return age.max - ageScale(d.age); })
									.y(function(d) {
										if (isStacked) {
											return warScale(d3.sum(warArray, function(war, index) {
												return index >= minIndex ? d[war.key] : 0;
											}));
										} else {
											return warScale(d[warArray[minIndex].key]);
										}
									})
									.interpolate('monotone')(playerData.records);*/

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
			var path = svg.append('path')
							.attr('d', warGraph(war, index))
							.attr('stroke', warType.color)
							.attr('stroke-width', LINE_WIDTH)
							.attr('fill', isStacked ? warType.color : 'none');

			// apply a style if it exists
			if (warType.style) {
				path.style(warType.style);
			}
		});

		// -------------------- Axes
		// helper function to get the year at a player's age
		function yearAtAge(records, age) {
			var year = null;
			$.each(records, function(index, record) {
				if (!year && record.age === age) {
					year = record.year;
				}
			});
			return year;
		}

		// helper function to get the player's age in a certain year
		function ageAtYear(records, year) {
			var age = null;
			$.each(records, function(index, record) {
				if (!age && record.year === year) {
					age = record.age;
				}
			});
			return age;
		}

		var yearScale = d3.scale.linear()
						  .domain([playerData.minYear, playerData.maxYear])
						  .range([ageScale(ageAtYear(playerData.records, playerData.minYear)),
						  	ageScale(ageAtYear(playerData.records, playerData.maxYear))]);

		// horizontal year axis
		svg.append('g')
			.attr('class', 'axis')
			.attr('transform', 'translate(0,' + (CHART_TOP_PADDING) + ')')
			.call(d3.svg.axis()
						.scale(yearScale)
						.orient('bottom')
						.innerTickSize(0)
						.outerTickSize(10)
						.tickValues(2) // every third year // TODO: outer years
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
		// helper function to adjust for text width to center an object
		// allows for adjustment in either the x or y dimension, defaulting to x
		// allows for muliple adjustments as specified by num, in the unit of half width
		// assumes one half width unless otherwise specified
		// allows for additional padding to the adjustment as specified 
		// subtract negative padding to protect against a string being passed in
		function adjustObjLoc(obj, isY, halfWidths, padding) {
			obj.attr((isY ? 'y' : 'x'), obj.attr((isY ? 'y' : 'x')) - (halfWidths ? halfWidths : 1) *
				$(obj.node()).width() / 2 - -(padding ? padding : 0));
		}

		// vertical WAR axis title
		var warAxisTitle = svg.append('text')
								.attr('class', 'axis-title vert-text')
								.attr('x', -(CHART_HEIGHT - CHART_BOTTOM_PADDING + CHART_TOP_PADDING) / 2)
								.attr('y', CHART_LEFT_PADDING - AXIS_LEFT_PADDING)
								.text('WAR');

		// center the vertical axis title
		adjustObjLoc(warAxisTitle);

		// -------------------- Champ stats and year lines
		$.each(playerData.records, function(index, record) {
			// initial value of y -- the bottom of the graph
			var y;
			if (playerType === 'pitchers') {
				y = warScale(Math.min(record.WARra9, record.WARfip) / 2) + CHAMP_SIZE;
			} else {
				y = warScale((record['Value Batting'] + record['Value Fielding']) / 2);
			}
			$.each(champ, function(index, stat) {
				// if the player was the champion of this stat for this year
				if(record[stat + 'champ']) {
					// add a note to indicate they were that stats' champion
					var champNote = svg.append('text')
										.attr('class', 'champ-note')
										.attr('x', ageScale(record.age))
										.attr('y', y)
										.text(stat);

					// adjust x position to center notes on the year
					adjustObjLoc(champNote);

					// adjust y for the next stat
					y += CHAMP_SIZE;
				}
			});
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
		$.each(awards, function(awardIndex, award) {
			// add a label
			var awardLabel = svg.append('text')
								.attr('class', 'award-text')
								.attr('x', AWARD_BASE_X)
								.attr('y', yAward)
								.text(award.name);

			// adjust label backwards a full width (2 half-widths) to line up the text
			adjustObjLoc(awardLabel, false, 2);

			// for each year
			$.each(playerData.records, function(playerIndex, record) {
				var isWon = record[award.key] && record[award.key] != 'n/a';
				// add an icon corresponding to an award if won
				if (isWon && awardIndex != awards.length - 1) {
					svg.append('image')
						.attr('xlink:href', 'images/icons/' + award.key + '.png')
						.attr('x', ageScale(record.age))
						.attr('y', yAward - AWARD_SIZE + AWARD_INTERIOR_PADDING)
						.attr('width', AWARD_SIZE)
						.attr('height', AWARD_SIZE)
				}

				if (award.key === 'ws' && isWon) {
					svg.append('image')
						.attr('xlink:href', 'images/icons/' + award.key + '.png')
						.attr('x', ageScale(record.age) - WS_ICON_SIZE / 2)
						.attr('y', warScale(playerType ===  'pitcher' ? Math.max(record.WARra9, record.WARfip) :
							record['Value Batting'] + record['Value Fielding'] + record['Value Running'])
							- WS_ICON_SIZE)
						.attr('width', WS_ICON_SIZE)
						.attr('height', WS_ICON_SIZE)
				}
			});

			// add in a separating line on top for all but the last award
			if (index !== awards.length - 1) {
				svg.append('line')
					.attr('x1', ageScale(age.min))
					.attr('y1', yAward + AWARD_INTERIOR_PADDING)
					.attr('x2', ageScale(age.max))
					.attr('y2', yAward + AWARD_INTERIOR_PADDING)
					.style({"stroke-dasharray": ("3, 3")})

			}

			// update yAward for the next award
			yAward += AWARD_SIZE + AWARD_INTERIOR_PADDING;
		});

		// ======================================== Polygon
		// create a svg for the polygon
		var polySvg = row.append('div')
							.attr('class', 'col-xs-8 col-sm-3')
							.append('svg')
							.attr('width', POLY_WIDTH)
							.attr('height', POLY_HEIGHT);

		// helper function to get x coordinate
		function getX(radius, angle) {
			return POLY_WIDTH / 2 + radius * Math.cos(angle);
		}

		// helper function to get y coordinate
		function getY(radius, angle) {
			return (POLY_HEIGHT + POLY_TITLE_SIZE + POLY_TITLE_TOP_PADDING) / 2 +
				radius * Math.sin(angle);
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

		// helper function to adjust the location of the polygon label
		function adjustPolyLabelLoc(label, angle) {
			// adjust x location

			// if label is on the left, move one width left and add padding
			if (Math.cos(angle) < -ZERO_EPSILON) {
				adjustObjLoc(label, false, 2, -POLY_LABEL_PADDING);

			// if label is on top/bottom, move half width left
			} else if (Math.abs(Math.cos(angle)) < ZERO_EPSILON) {
				adjustObjLoc(label);
			
			// if label is on the left, add padding.
			// parseFloat to convert string to float, because .attr('y') returns string
			// and the + operator concatenates rather than adds
			} else { // TODO: convert to adjustObjLoc
				//adjustObjLoc(label, false, 0, POLY_LABEL_PADDING);
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

		// helper function to draw a skill polygon
		function drawCareerSkillPolygon(skills, records) {
			var path = '';
			var dRadians = 2 * Math.PI / POLY_SIDES;

			// straight upwards
			var angle = -Math.PI / 2;

			// maximum radius, to edge of polygon
			var maxR = NUM_POLY * POLY_D_RADIUS;

			// for each skill
			$.each(skills, function(index, skill) {
				var scale = d3.scale.linear()
									// average all means and bests in the career years
									.domain([d3.mean(records, function(d) { return d[skill.key + 'mean']; }),
										d3.mean(records, function(d) { return d[skill.key + 'best']; })])
									.range([maxR / 2, maxR]);

				// insure that all radii are in the range [0, maxR]
				// take the average over the career
				path += pathPt(Math.min(Math.max(0, scale(
					d3.mean(records, function(d) { return d[skill.key]; }))), maxR), angle);

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

			// draw the skills polygon with color specified by the teams
			return polySvg.append('path')
							.attr('d', 'M' + path.substring(1) + 'Z')
							.attr('stroke', POLY_SKILL_STROKE)
							.attr('stroke-width', POLY_SKILL_STROKE_WIDTH)
							.attr('fill', records[0].teamColor) // TODO: choose and get the correct index
							.attr('opacity', POLY_SKILL_OPACITY);
		}

		// draws the polygon and its title in its entirety
		// layers from bottom to top: 1) Team image
		//                            2) Regular polygons
		//                            3) Skill polygon
		function drawPolygon(name, records) {
			var polyTitle = polySvg.append('text')
									.attr('class', 'polygon-title')
									.attr('y', POLY_TITLE_SIZE + POLY_TITLE_TOP_PADDING)
									.text('Skills Polygon: ' + 'Career');

			// adjust x position to center
			polyTitle.attr('x', (POLY_WIDTH - $(polyTitle.node()).width()) / 2);

			// add a key for the player to store the skill polygon for later access
			skillPolygons[name] = {
				image: polySvg.append('image')
								.attr('xlink:href', records[0].teamImage) // TODO: choose and get correct index
								.attr('x', (POLY_WIDTH - POLY_IMAGE_SIZE) / 2)
								.attr('y', (POLY_HEIGHT - POLY_IMAGE_SIZE +
									POLY_TITLE_TOP_PADDING + POLY_TITLE_SIZE) / 2)
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

			// draw the skill polygon
			skillPolygons[name].poly = drawCareerSkillPolygon(advanced, records);
		}

		// draw the polygon
		// TODO: make flexible between single year, range, and career
		drawPolygon(playerData.name, playerData.records);

		// initialize a div to hold the interaction form
		// export responsibility to make the form to the controller
		row.append('div').attr('class', 'col-xs-4 col-sm-2 vis-form-wrapper');

	});
/*
	// ======================================== Legend
	// TODO: make the legend
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

visualizeCareers(processed.pitchers, 'pitchers', PITCHER_WAR, PITCHER_CHAMP_STATS, PITCHER_AGE_BOUNDS,
	PITCHER_AWARDS, PITCHER_STATS_BASIC, PITCHER_STATS_ADV, false);
visualizeCareers(processed.hitters, 'hitters', HITTER_WAR, HITTER_CHAMP_STATS, HITTER_AGE_BOUNDS,
	HITTER_AWARDS, HITTER_STATS_BASIC, HITTER_STATS_ADV, true);

// ======================================== Navigation Column
