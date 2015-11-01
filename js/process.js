/* process.js
 * Eli Shayer
 * ------------------
 * Processes the pitcher data into a single, more accessible object
 */


// ---------------------------------------- Data Processing

// constants
var NOT_FOUND_SENTINEL = -1;

// helper function to get the index of a name
// assumes unique names -- safe assumption for this
function getNameIndex(name) {
    for (var i = 0; i < pitcherDataProcessed.length; i++) {
        if (pitcherDataProcessed[i].name === name) {
            return i;
        }
    }
    return NOT_FOUND_SENTINEL;
}

// array to hold the processed pitcher data
var pitcherDataProcessed = [];

// process the pitcher data
$.each(pitcherData, function(index, record) {

    // get the index of the pitcher by name
    var nameIndex = getNameIndex(record.name);

    // create a new record if none exists
    if (nameIndex === NOT_FOUND_SENTINEL) {
        pitcherDataProcessed.push({
            name    : record.name,
            records : []
        });

        // index is now the last entry in the processed data array
        nameIndex = pitcherDataProcessed.length - 1;
    }

    if (record.year !== 'Career') {
        // add this current record to the processed data
        pitcherDataProcessed[nameIndex].records.push(record);
    }
});