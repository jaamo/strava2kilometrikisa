//include basic requirments
// const express = require('express');
// const app = express();
// const bodyParser = require('body-parser');
// const morgan = require('morgan');
// const config = require('./config')();
const mongoose = require('mongoose');
// const session = require('express-session');
// const MongoStore = require('connect-mongo')(session);

// Connect to MongoDB.
mongoose.connect('mongodb://'+process.env.KILOMETRIKISA_DBUSER+':'+process.env.KILOMETRIKISA_DBPASSWORD+'@'+process.env.KILOMETRIKISA_DBHOST+'/'+process.env.KILOMETRIKISA_DB);

// Controllers
// const Home = require('./controllers/Home');
// const Friends = require('./controllers/Friends');
// const Activities = require('./controllers/Activities');
// const User = require('./controllers/User');
// const Kilometrikisa = require('./controllers/Kilometrikisa');
// const StravaAuth = require('./controllers/StravaAuth');
// const Sync = require('./controllers/Sync');

const Cron = require('./cron');

// console.log('yolo');
Cron.run();
