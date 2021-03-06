/**
 * Express middleware
 */
let express = require('express');
let path = require('path');
let cookieParser = require('cookie-parser');
let logger = require('morgan');

/**
 * Database middleware
 */
let db = require('./service/db');

/**
 * Authentication credentials
 */
let credentials = require('./credentials');

/**
 * api endpoints
 */
let indexRouter = require('./routes/index');
let playersRouters = require('./routes/players');
let teamStatsApi = require('./routes/feed/teamStatsApi');
let playerStatsApi = require('./routes/feed/playerStatsApi');
let serviceWorkerApi = require('./routes/serviceWorkerApi');

// service worker - does some useful shit
let serviceWorker = require('./service/service-workers/serviceWorker');
let dbService = require('./service/dbService');

let insertService = require('./service/service-workers/insertionWorker');
//connect to db
const url = 'mongodb://' +  credentials.mongo.username + ':' + credentials.mongo.password + '@hattrickcluster-shard-00-00-zgcgc.mongodb.net:27017,hattrickcluster-shard-00-01-zgcgc.mongodb.net:27017,hattrickcluster-shard-00-02-zgcgc.mongodb.net:27017/test?ssl=true&replicaSet=HatTrickCluster-shard-0&authSource=admin&retryWrites=true';
db.init(url).then((config) => {
    console.log('Connected to db...');
    /**
     * Put any service workers here or
     * uncomment the service worker you want 
     * to use and the service will be
     * executed upon the start of the server
     */
    insertService.insertTeamProfiles();
    insertService.insertPlayerProfiles();

}).catch((err) => {
    throw new Error(err);
});

// create the express object
let app = express();

// needs these dependencies
app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));


// base app endpoints
app.use('/', indexRouter);
app.use('/players', playersRouters);
// feed endpoints
app.use('/api/player-stats/', playerStatsApi);
app.use('/api/team-stats/', teamStatsApi);
// service worker
app.use('/api/service-worker/', serviceWorkerApi);

module.exports = app;
