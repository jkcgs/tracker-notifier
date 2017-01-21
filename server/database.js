const debug = require('debug')('tracker-notifier:dbinit');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let config = require('../config.json');
let db = mongoose.connection;

mongoose.connect(config.dburi);
db.on('error', console.error.bind(console, 'Connection error:'));
db.once('open', () => {
    debug('Connected to database!');

    // Get users count
    let User = require('./models/user');
    User.find((err, res) => {
        if(err) {
            throw err;
        }

        // Display user count
        debug('Users: ' + res.length);
        if(res.length > 0) {
            return;
        }

        // Add initial user if no user was found
        let hehe = new User({
            username: config.initUserName,
            password: config.initUserPass,
            spcode: ''
        });

        hehe.save((err2) => {
            if(err2) {
                throw err2;
            }

            debug('Initial user added!');
        });
    });
});

module.exports = db;