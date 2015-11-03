/* process.js
 * Eli Shayer
 * ------------------
 * Processes the pitcher and hitter data into a single, more accessible object
 */


// ---------------------------------------- Data Processing

// constants
var NOT_FOUND_SENTINEL = -1;

// object to hold processed data
var processed = {};
processed.hitters = [];
processed.pitchers = [];

// helper function to get the index of a name
// assumes unique names -- safe assumption for this
function getNameIndex(key, name) {
    for (var i = 0; i < processed[key].length; i++) {
        if (processed[key][i].name === name) {
            return i;
        }
    }
    return NOT_FOUND_SENTINEL;
}

// helper functions to process the data
function processData(dataset, key) {
    $.each(dataset, function(index, record) {

        // get the index of the player by name
        var nameIndex = getNameIndex(key, record.name);

        // create a new record if none exists
        if (nameIndex === NOT_FOUND_SENTINEL && record.year !== 'Career') {
            processed[key].push({
                name    : record.name,
                records : []
            });

            // index is now the last entry in the processed data array
            nameIndex = processed[key].length - 1;
        }

        if (record.year !== 'Career') {
            // add this current record to the processed data
            processed[key][nameIndex].records.push(record);
        }
    });
}

// process each dataset
processData(pitcherData, 'pitchers');
processData(hitterData, 'hitters');

// convert runs to WAR for hitter data for the following fields
var conversionStats = ['Batting', 'Running', 'Fielding'];

var RUNS_PER_WAR = 10;

// for each hitter
$.each(processed.hitters, function(index, hitter) {
    // for each year
    $.each(hitter.records, function(index, record) {
        // for each stat
        $.each(conversionStats, function(index, stat) {
            record['Value ' + stat] /= RUNS_PER_WAR;
            record['Value ' + stat + ' LL'] /= RUNS_PER_WAR;
            record['Value ' + stat + ' LA'] /= RUNS_PER_WAR;
        });
    })
});
