const debug = require('debug')('tracker-notifier:dbinit');
const mongoose = require('mongoose');
mongoose.Promise = global.Promise;

let config = require('../config.json');

let db = mongoose.connection;

mongoose.connect(config.dburi);
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', () => {
    debug('Connected to database!');

    let User = require('../models/user');
    User.find((err, res) => {
        if(err) {
            throw err;
        }

        debug('Users: ' + res.length);
        if(res.length === 0) {
            let hehe = new User({
                username: config.initUserName,
                password: config.initUserPassword
            });

            hehe.save((err2, res, aff) => {
                if(err2) {
                    throw err2;
                }

                debug('Init user added!');
            });
        }
    });
});

module.exports = db;