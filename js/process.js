/* process.js
 * Eli Shayer
 * ------------------
 * Processes the pitcher and hitter data into a single, more accessible object
 * Adds in the team image file name to each record
 */

// constants
var NOT_FOUND_SENTINEL = -1;

// the current year for present logos
var PRESENT_YEAR = 2015;

// team image data to select
var TEAM_IMAGES = {
    BOS: [
        {
            minYear: 1901,
            maxYear: 1907,
            file: 'bostonamericans1901-1907'
        },
        {
            minYear: 1908,
            maxYear: 1923,
            file: 'redsox1908-1924'
        },
        {
            minYear: 1924,
            maxYear: 1960,
            file: 'redsox1924-1960'
        },
        {
            minYear: 1976,
            maxYear: 2008,
            file: 'redsox1976-2008'
        }
    ],
    BSN: [
        {
            minYear: 1900,
            maxYear: 2000,
            file: 'TODO'
        }
    ],
    BRO: [
        {
            minYear: 1952,
            maxYear: 1957,
            file: 'brooklyndodgers1952-1957'
        }
    ],
    CHC: [
        {
            minYear: 1918,
            maxYear: 1918,
            file: 'cubs1918'
        },
        {
            minYear: 1919,
            maxYear: 1926,
            file: 'cubs1919-1926'
        }
    ],
    CHW: [
        {
            minYear: 1982,
            maxYear: 1986,
            file: 'whitesox1982-1986'
        }
    ],
    CIN: [
        {
            minYear: 1915,
            maxYear: 1919,
            file: 'reds1915-1919'
        },
        {
            minYear: 1972,
            maxYear: 1992,
            file: 'reds1972-1992'
        }
    ],
    // no logo exists for Cleveland Spiders, use Cleveland Naps in its place
    CLV: [
        {
            minYear: 1890,
            maxYear: 1898,
            file: 'clevelandnaps1909'
        }
    ],
    CLE: [
        {
            minYear: 1909,
            maxYear: 1909,
            file: 'clevelandnaps1909'
        },
        {
            minYear: 1910,
            maxYear: 1914,
            file: 'clevelandnaps1910-1914'
        }
    ],
    DET: [
        {
            minYear: 1905,
            maxYear: 1907,
            file: 'tigers1905-1907'
        },
        {
            minYear: 1908,
            maxYear: 1913,
            file: 'tigers1908-1913'
        },
        {
            minYear: 1914,
            maxYear: 1915,
            file: 'tigers1914-1915'
        },
        {
            minYear: 1916,
            maxYear: 1916,
            file: 'tigers1916'
        },
        {
            minYear: 1917,
            maxYear: 1917,
            file: 'tigers1917'
        },
        {
            minYear: 1918,
            maxYear: 1920,
            file: 'tigers1918-1920'
        },
        {
            minYear: 1921,
            maxYear: 1924,
            file: 'tigers1921-1924'
        },
        {
            minYear: 1925,
            maxYear: 1925,
            file: 'tigers1925'
        },
        {
            minYear: 1926,
            maxYear: 1926,
            file: 'tigers1926'
        }
    ],
    HOU: [
        {
            minYear: 2000,
            maxYear: 2012,
            file: 'astros2000-2012'
        }
    ],
    // TODO: get the actual Angels logo
    LAA: [
        {
            minYear: 1900,
            maxYear: PRESENT_YEAR,
            file: 'TODO'
        }
    ],
    LAD: [
        {
            minYear: 1958,
            maxYear: 1967,
            file: 'dodgers1958-1967'
        },
        {
            minYear: 1968,
            maxYear: 1971,
            file: 'dodgers1968-1971'
        }
    ],
    LOU: [
        {
            minYear: 1800,
            maxYear: 2000,
            file: 'TODO'
        }
    ],
    NYG: [
        {
            minYear: 1900,
            maxYear: 1907,
            file: 'newyorkgiants1904-1907'
        },
        {
            minYear: 1908,
            maxYear: 1908,
            file: 'newyorkgiants1908'
        },
        {
            minYear: 1909,
            maxYear: 1909,
            file: 'newyorkgiants1909'
        },
        {
            minYear: 1910,
            maxYear: 1910,
            file: 'newyorkgiants1910'
        },
        {
            minYear: 1911,
            maxYear: 1912,
            file: 'newyorkgiants1911-1912'
        },
        {
            minYear: 1913,
            maxYear: 1914,
            file: 'newyorkgiants1913-1914'
        },
        {
            minYear: 1915,
            maxYear: 1915,
            file: 'newyorkgiants1915'
        },
        {
            minYear: 1916,
            maxYear: 1916,
            file: 'newyorkgiants1916'
        },
        // TODO: fix this
        {
            minYear: 1951,
            maxYear: 1957,
            file: 'giants1958-1976'
        }
    ],
    NYM: [
        {
            minYear: 1962,
            maxYear: 1992,
            file: 'mets1962-1992'
        }
    ],
    NYY: [
        {
            minYear: 1915,
            maxYear: 1946,
            file: 'yankees1915-1946'
        },
        {
            minYear: 1947,
            maxYear: 1967,
            file: 'yankees1947-1967'
        },
        {
            minYear: 1968,
            maxYear: PRESENT_YEAR,
            file: 'yankees1968-pres'
        }
    ],
    PHA: [
        {
            minYear: 1901,
            maxYear: 1901,
            file: 'philadelphiaathletics1901'
        },
        {
            minYear: 1902,
            maxYear: 1919,
            file: 'philadelphiaathletics1902-1919'
        },
        {
            minYear: 1924,
            maxYear: 1927,
            file: 'philadelphiaathletics1924-1927'
        },
        {
            minYear: 1928,
            maxYear: 1929,
            file: 'philadelphiaathletics1928-1929'
        },
        {
            minYear: 1930,
            maxYear: 1938,
            file: 'philadelphiaathletics1930-1938'
        }
    ],
    PHI: [
        {
            minYear: 1900,
            maxYear: 1937,
            file: 'phillies1900-1937'
        }
    ],
    PIT: [
        {
            minYear: 1900,
            maxYear: 1906,
            file: 'pirates1900-1906'
        },
        {
            minYear: 1907,
            maxYear: 1907,
            file: 'pirates1907'
        },
        {
            minYear: 1908,
            maxYear: 1909,
            file: 'pirates1908-1909'
        },
        {
            minYear: 1910,
            maxYear: 1914,
            file: 'pirates1910-1914'
        },
        {
            minYear: 1915,
            maxYear: 1919,
            file: 'pirates1915-1919'
        },
        {
            minYear: 1967,
            maxYear: 1986,
            file: 'pirates1967-1986'
        },
        {
            minYear: 1987,
            maxYear: 1996,
            file: 'pirates1987-1996'
        }
    ],
    SFG: [
        {
            minYear: 1951,
            maxYear: 1976,
            file: 'giants1958-1976'
        },
        {
            minYear: 1983,
            maxYear: 1993,
            file: 'giants1983-1993'
        },
        {
            minYear: 1994,
            maxYear: 1999,
            file: 'giants1994-1999'
        },
        {
            minYear: 2000,
            maxYear: PRESENT_YEAR,
            file: 'giants2000-present'
        }
    ],
    SLB: [
        {
            minYear: 1916,
            maxYear: 1935,
            file: 'stlouisbrowns1916-1635'
        }
    ],
    SLM: [
        {
            minYear: 1914,
            maxYear: 1915,
            file: 'stlouisterriers1914-1915'
        }
    ],
    STL: [
        {
            minYear: 1899,
            maxYear: 1919,
            file: 'perfectos-cardinals1899-1919'
        },
        {
            minYear: 1922,
            maxYear: 1926,
            file: 'cardinals1922-1926'
        },
        {
            minYear: 1927,
            maxYear: 1929,
            file: 'cardinals1927-1928'
        },
        {
            minYear: 1956,
            maxYear: 1966,
            file: 'cardinals1956-1966'
        },
        {
            minYear: 1967,
            maxYear: 1997,
            file: 'cardinals1967-1997'
        },
        {
            minYear: 1998,
            maxYear: PRESENT_YEAR,
            file: 'cards1998-pres'
        }
    ],
    TOR: [
        {
            minYear: 1997,
            maxYear: 2002,
            file: 'bluejays1997-2002'
        }
    ],
    WSH: [
        {
            minYear: 1907,
            maxYear: 1911,
            file: 'washingtonsenators1907-1911'
        },
        {
            minYear: 1912,
            maxYear: 1927,
            file: 'washingtonsenators1912-1927'
        }
    ]
};

// object to hold processed data
var processed = {};
processed.hitters = [];
processed.pitchers = [];

// helper function to get the name of the team image for a record
function getTeamImage(team, year) {
    var file = '';
    //console.log(team);
    if (!TEAM_IMAGES[team.substring(0, 3)]) {
        console.log(team);
        console.log(year);
    }
    // use the first three char team code in the case of multiple teams
    $.each(TEAM_IMAGES[team.substring(0, 3)], function(index, logo) {
        // if a file hasn't yet been selected and the years match
        if (!file.length && year >= logo.minYear && year <= logo.maxYear) {
            file = logo.file;
        }
    });
    return file;
}

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
            // add the team image to the record
            if (record.team) {
                var teamlogo = getTeamImage(record.team, record.year);
                if (!teamlogo.length) {
                    console.log(record.team);
                    console.log(record.year);
                }
            }
            if (record.team) {
                record.teamImage = 'images/teams/' + getTeamImage(record.team, record.year) + '.jpg';
            }

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
