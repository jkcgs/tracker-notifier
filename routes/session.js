const debug = require('debug')('tracker-notifier:session');
const express = require('express');
const util = require('util');
const bcrypt = require('bcrypt');
let User = require('../models/user');
let router = express.Router();

router.post('/login', function(req, res, next) {
    let sess = req.session;

    req.checkBody('username', 'Invalid username').notEmpty();
    req.checkBody('password', 'Invalid password').notEmpty();
    
    req.getValidationResult().then((result) => {
        if(!result.isEmpty()) {
            res.status(400).send('There have been validation errors: ' + util.inspect(result.array()));
            return;
        }

        return User.findOne({username: req.body.username}).then((dbres) => {
            if(!dbres) {
                //res.status(400).send('Wrong user-password combination');
                debug('Unknown user ' + req.body.username);
                res.status(400).send('The user does not exists ' + util.inspect(dbres));
                return;
            }

            return bcrypt.compare(req.body.password, dbres.password).then((matches) => {
                if(!matches) {
                    debug('Wrong password for user ' + req.body.username);
                    res.status(400).send('Wrong user-password combination');
                    return;
                }

                debug('User logged ' + req.body.username);
                sess.logged = true;
                sess.username = result.username;
                res.redirect('/panel');
            });
        });
    }).catch((reason) => {
        debug(reason);
        res.status(500);
        res.render('error', {
            message: 'Login error',
            error: reason
        });
    });
});

router.get('/logout', function(req, res) {
    req.session.regenerate((err) => {
        if(err) {
            throw err;
        }

        res.redirect('/');
    });
});

module.exports = router;