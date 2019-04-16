/**
 * Service worker, will be responsible for
 * frequently updating the database and making calculations
 */

let file = require('fs');
let db = require('../db');
let dbService = require('../dbService');
let references = require('./ref/ref');
let stats = require('../../lib/stats');
// request manager
let requestManager = require('../../middlewares/requestManager');
// response parser
let responseParser = require('../../middlewares/responseParser');
let credentials = require('../../credentials');
let ref = require('./ref/ref');

/**
 * Get all players
 *
 * Makes a call to the mysportsfeeds api to gather
 * the data specified by the request manager (in
 * this case, all players) and returns a promise
 * with the raw data
 */
module.exports.getAllPlayers = function() {
    console.log('in the promise');
    return new Promise((resolve, reject) => {
        let request = requestManager.buildRequest('v2.0', 'nba', '2018-2019-regular', 'player_stats_totals', {});
        let data = requestManager.makeRequest(request);
        if(data) {
            resolve(data);
        } else if(!data) {
            reject('The Promise Request Could Not Be Made');
        } else if(data.playerStatsTotals.length == 0) {
            reject('The Requested Resource Could Not Be Found');
        }
    });
};

/**
 * Get all team players
 *
 * Work in progress
 */
module.exports.getAllTeamPlayers = function() {

};

module.exports.getAllSeasonalTeamStats = function() {
    return new Promise((resolve, reject) => {
        let request = requestManager.buildRequest('v2.0', 'nba', '2018-2019-regular', 'team_stats_totals', {});
        let data = requestManager.makeRequest(request);
        if(data) {
            resolve(data);
        } else if(!data) {
            reject('The Promise Request Could Not Be Made');
        } else if(data.playerStatsTotals.length == 0) {
            reject('The Requested Resource Could Not Be Found');
        }
    });
};


module.exports.insertAllSeasonalTeamStats = function() {
    try {
        this.getAllSeasonalTeamStats().then((data) => {
            // get the payload
            let payload = responseParser.payload(data, "teamStats");
            // connect to db
            let options = {};
            // insert
            dbService.insert(db.collection(credentials.mongo.collections.teamStats), payload, options).then((res) => {
                console.log('Inserted successfully...');
            }).catch((err) => {
                throw new Error(err);
            });
        }).catch((data) => {
            console.log(data);
            console.log(new Error(data));
        });
    } catch(e) {
        console.log('An error occurred: ' + e);
    }
};




/**
 * Get all players
 *
 * Makes a call to the mysportsfeeds api to gather
 * the data specified by the request manager (in
 * this case, all players) and returns a promise
 * with the raw data
 */
module.exports.getAllPlayerProfiles = function() {
    console.log('in the promise');
    return new Promise((resolve, reject) => {
        let request = requestManager.buildRequest('v2.0', 'nba', '', 'players', {});
        let data = requestManager.makeRequest(request);
        if(data) {
            resolve(data);
        } else if(!data) {
            reject('The Promise Request Could Not Be Made');
        } else if(data.playerStatsTotals.length == 0) {
            reject('The Requested Resource Could Not Be Found');
        }
    });
};


module.exports.insertAllPlayerProfiles = function() {
    try {
        this.getAllPlayerProfiles().then((data) => {
        let payload = responseParser.payload(data, "players");
        let options = {};
        // change the collection
        // for this operation
        dbService.insert(db.collection(credentials.mongo.collections.playerProfiles), payload, options).then((res) => {
            console.log('Inserted successfully...');
            // change the collection back
        }).catch((err) => {
            throw new Error(err);
        });
      }).catch((err) => {
          throw new Error(err);
      });
  } catch (e) {
      console.log('An error occurred: ' + e);
  }
};


/**
 * Insert all players
 *
 * Inserts all players into the database with the specified
 * collection that is provided from db module. Will receive
 * payload, that is, the array of json objects from the
 * payload function and will insert that data into the db
 * via the db service insert method
 */
module.exports.insertAllPlayers = function() {
    try {
        this.getAllPlayers().then((data) => {
            // get the payload
            let payload = responseParser.payload(data, "playerStats");
            // connect to db
            let options = {};
            // insert
            dbService.insert(db.collection(credentials.mongo.collections.playerStats), payload, options).then((res) => {
                console.log('Inserted successfully...');
            }).catch((err) => {
                throw new Error(err);
            });
        }).catch((data) => {
            console.log(data);
            console.log(new Error(data));
        });
    } catch(e) {
        console.log('An error occurred: ' + e);
    }
};

/**
 * Update player with id
 *
 * Takes an id of a player and will update that
 * player with a new object of type array that is
 * specifies. Calls the db service update function
 * with the included new desired update object
 */
function updatePlayerWithId(id, arr, options) {
    options = {} || options;
    try {
        dbService.update(db.collection(credentials.mongo.collections.playerStats), {"player.id":id}, arr, options).then((result) => {
            console.log('Successfully updated ' + id);
        }).catch((err) => {
            throw new Error(err);
        });
    } catch(e) {
        throw new Error(e);
    }
}
// export the module
module.exports.updatePlayerWithId = updatePlayerWithId;


/**
 * find player with id
 *
 * Takes an id of a player and will find that
 * player in the collection
 */
module.exports.findPlayerWithId = function(id, options, callback) {
    options = {} || options;
    try {
        dbService.find(db.collection(credentials.mongo.collections.playerStats), {"player.id":id}, options).then(function(result) {
            callback(result[0] == "undefined"? [] : result[0]);
        }).catch(function(err) {
            throw new Error(err);
        })
    } catch(e) {
        console.log('An error occurred: ' + e);
    }
};


/**
 * Update player
 *
 * Takes a query  and will update that
 * player with a new object of type array that is
 * specifies. Calls the db service update function
 * with the included new desired update object
 */
function updatePlayer(query, arr, options) {
    options = {} || options;
    try {
        dbService.replaceOne(db.collection(credentials.mongo.collections.playerStats), query, arr, options).then((result) => {
            console.log('Successfully replaced ' + result);
        }).catch((err) => {
            throw new Error(err);
        });
    } catch(e) {
        throw new Error(e);
    }
}


/**
 * Update all players
 *
 * Enumerates through the array player ids and
 * compares each player id at j with the player
 * id at i in the payload. If j = i, then that means
 * that the current player id matches the current player,
 * thus in this case causes that player at j to be repalced
 * with the player at i
 */
module.exports.updateAllPlayers = function() {
    console.log('Starting update...');
    try {
      this.getAllPlayers().then(function(data) {
          let pullAll = new Promise((resolve, reject) => {
              dbService.find(db.collection(credentials.mongo.collections.playerStats), {}, {}).then((dbResponse) => {
                  resolve(dbResponse);
              }).catch((err) => {
                  reject(err);
              });
          });
          pullAll.then(function(dbResponse) {
              let payload = responseParser.payload(data, "playerStats");
              for(let j = 0; j < dbResponse.length; j++) {
                  let currentId = dbResponse[j].player.id;
                  for(let i = 0; i < payload.length; i++) {
                      let current = payload[i];

                      if(current.player.id == currentId) {
                          let res = payload.filter(temp => temp.player.id == currentId);
                          if(res.length > 1) {
                              // they played for 2 or more teams
                              // so we need to update all of those
                              for(let k = 0; k < res.length; k++) {
                                  let teamId = res[k].team.id;
                                  let playerId = res[k].player.id;
                                  updatePlayer({$and:[{"player.id":playerId}, {"team.id":teamId}]}, res[k], {});
                              }
                          } else {
                              // they only played for 1 team
                              updatePlayerWithId(currentId, payload[i], {});
                          }
                          // done
                          break;
                      }
                  }
              }
              console.log('Updating completed...');
          }).catch(function(err) {
            console.log(err);
          });

      }).catch(function(err) {
          console.log(err);
      })
  } catch(e) {
      console.log('An error occurred: ' + e);
  }
};


/**
 * Wild card search
 *
 * Will query the db's indices to find
 * the specified string that the
 * user will search for and passes the array
 * of search results into a callback
 */
module.exports.wildcard = function(queryString, options, callback) {
    dbService.wildcardSearch(db.collection(credentials.mongo.collections.playerStats), queryString, options).then(function(data) {
        callback(data);
    })
};



/**************************************************************
 ************************* FILE WRITERS ***********************
 **************************************************************/



/**
 * Get all team ids
 *
 * Writes to a text file a comma delimited list of
 * all team ids. To avoid duplicates, a blacklist is
 * maintained; if the next id is discovered that is
 * already in the blacklist, this means its already found
 * and we can therefore skip it
 */
module.exports.getAllTeamIds = function() {
        dbService.find(db.collection(credentials.mongo.collections.playerStats), {}, {}).then((data) => {
            let blacklist = [];
            let dataField = [];
            for(let i = 0; i < data.length; i++) {
                let current = data[i];
                try {
                    // don't write them twice
                    if(!blacklist.includes(current.team.id.toString())) {
                        dataField.push("'" + current.team.id.toString() +"'");
                    }
                    // keep track
                    blacklist.push(current.team.id.toString());
                } catch(err) {
                    if(blacklist.length < 1) {
                        console.log('Field is null or undefined, skipping over...');
                    }
                }
            }
            console.log(dataField);
            file.appendFile('./service/service-workers/ref/TeamIDs.txt', dataField.toString(), 'utf8', function(err) {
                if(err) {
                    console.log(err);
                } else {
                    console.log('Successfully wrote...');
                }
            })
        }).catch((err) => {
            throw new Error(err);
        });
};

/**
 * Get all player ids
 *
 * Writes to a text file a comma delimited list of
 * all player ids. To avoid duplicates, a blacklist is
 * maintained; if the next id is discovered that is
 * already in the blacklist, this means its already found
 * and we can therefore skip it
 */module.exports.getAllPlayerIds = function() {
    dbService.find(db.collection(credentials.mongo.collections.playerStats), {}, {}).then((data) => {
        let blacklist = [];
        let dataField = [];
        for(let i = 0; i < data.length; i++) {
            let current = data[i];
            try {
                if(!blacklist.includes(current.player.id.toString())) {
                    dataField.push("'" + current.player.id.toString() +"'");
                }
                blacklist.push(current.player.id.toString());
            } catch(err) {
                if(blacklist.length < 1) {
                    console.log('Field is null or undefined, skipping over...');
                }
            }
        }
        console.log(dataField);
        file.appendFile('./service/service-workers/ref/PlayerIDs.txt', dataField.toString(), 'utf8', function(err) {
            if(err) {
                console.log(err);
            } else {
                console.log('Successfully wrote...');
            }
        })
    }).catch((err) => {
        throw new Error(err);
    });
};

