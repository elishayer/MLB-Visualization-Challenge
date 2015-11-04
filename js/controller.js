/* controller.js
 * Eli Shayer
 * -------
 * The controller file for the SSAC entry to the 
 * majorleaguedatachallenge.com visualization contest.
 * Allows for easier transitions between viewing players
 */

// ======================================== DOM Manipulation
// add a ul element to hold the list of players
var playerList = navCol.append('ul').attr('class', 'players-list');

// helper function to create an li tag > a tag with an href, class, and text
function createLinkLi(text, liClass, liId, href) {
	playerList.append('li')
				.attr('class', liClass)
				.attr('id', liId)
				.append('a')
				.attr('href', '#' + href)
				.text(text);
}

// for both hitters and pitchers
for (playerType in processed) {
	// add a player category li to the ul
	createLinkLi(playerType, 'nav-category', playerType + '-li', playerType + '-vis');

	// add an individual player li to the ul
	$.each(processed[playerType], function(index, player) {
		createLinkLi(player.name, 'nav-player', player.id + '-li', player.id);
	});
}

// a buffer from the top of the screen when viewing players
var BUFFER_TOP = 10;

// a buffer from the top of the screen to determine which player is being viewed
var BUFFER_VIEW = 200;

// selected class name
var selectedClass = "active-li";

// find the top and bottom players
var $allPlayers = $(".player-vis");
var $firstPlayer = $($allPlayers[0]);
var $lastPlayer = $($allPlayers[$allPlayers.length - 1]);

// use those two players to get breakpoints
var preBreakpoint, topBreakpoint, bottomBreakpoint;
setBreakpoints = function() {
	preBreakpoint = $('#nav').offset().top;
	topBreakpoint = $firstPlayer.offset().top;
	bottomBreakpoint = $lastPlayer.offset().top;
};

// initial call of set breakpoints
setBreakpoints();

// resets the breakpoints upon resize of the window
$(window).resize(setBreakpoints);

// cache jQuery objects for efficiency
var $playersList = $(".players-list");
var $window = $(window);

// respond every time a scroll occurs
$window.scroll(function () {
	// position the players list on the screen based on the scroll location
	var screenTop = $window.scrollTop();
	// if above all players, normal position and no players are selected
	if (screenTop < preBreakpoint) {
		$playersList.css({
			position: "relative",
			top: ""
		});
		$("." + selectedClass).toggleClass(selectedClass, false);
	// if below all players, lock the list into place at the bottom
	} else if (screenTop > $lastPlayer.offset().top) {
		$playersList.css({
			position: "relative",
			top: bottomBreakpoint - preBreakpoint
		});
	// if viewing players, make the list fixed and set one player as active
	} else { 
		$playersList.css({
			position: "fixed",
			top: BUFFER_TOP
		});
		// if screen is at the bottom, set the last player to active
		// buffer of 1 pixel for rounding
		if($(document).height() - $window.scrollTop() - $window.height() <= 1) {
			$("." + selectedClass).toggleClass(selectedClass, false);
			$("#" + $lastPlayer[0].id + "-li").toggleClass(selectedClass, true);
		}
		// if above all players, nothing is active
		else if (screenTop < topBreakpoint) {
			// remove the selection from anything currently selected
			$("." + selectedClass).toggleClass(selectedClass, false);
		} else {
			// set the active player
			var activePlayerSet = false;

			// for each player
			$allPlayers.each(function() {
				// cache the jQuery object and the player id
				var $player = $(this);
				var id = $player.attr('id');

				// protect against setting the active player again after it has been set
				if (!activePlayerSet) {

					// if the current player is the viewed player
					if ($player.offset().top + $player.outerHeight() > screenTop + BUFFER_VIEW) {
						console.log(id);
						// cache the id of the player in the ul list
						var listId = "#" + id + "-li";

						// protect against setting the current player when it would result in no change
						if (!$(listId).hasClass(selectedClass)) {
							$("." + selectedClass).toggleClass(selectedClass, false);
							$(listId).toggleClass(selectedClass, true);
						}
						activePlayerSet = true;	
					}
				}
			});
		}
	}
});
