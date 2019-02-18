// mongodb
let MongoClient = require('mongodb').MongoClient;
let assert = require('assert');
let credentials = require('../credentials');

// for testing
let mockObj = {
    test: "#FALNATION",
    anotherTest: 420,
    players: [{
        name: "Eoin",
        player: true
    }, {
        name: "Fal",
        favoriteThing: "beer"
    }],
    fal: true
};

/* db utilities */
let client = null;
let db = null;
let collection = null;

// initializes the
// db connection
module.exports.init = function(url) {
    return new Promise((resolve, reject) => {
        console.log('Connecting to db...');
        let options = {
            useNewUrlParser: true
        };
        MongoClient.connect(url, options).then((response) => {
            console.log('Working...');
            client = response;
            // specify the database
            db = response.db(credentials.mongo.dbs.dbTest);
            // specify the collection
            collection = db.collection(credentials.mongo.collections.collectionDev);
            let config = {
                client:client,
                db:db,
                collection:collection
            };
            resolve(config  );
        }).catch((err) => {
            reject(err);
        });
    });
};

module.exports.getDb = () => {
    return db;
};

module.exports.getCollection = () => {
    return collection;
};

module.exports.getClient = () => {
    return client;
};

