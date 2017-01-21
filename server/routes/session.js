const debug = require('debug')('tracker-notifier:session');
const express = require('express');
const util = require('util');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const jwtVerify = require('../jwt-verify');
const config = require('../../config.json');

let User = require('../models/user');
let router = express.Router();

router.post('/login', function(req, res, next) {
    let sess = req.session;

    req.checkBody('username', 'Usuario no ingresada').notEmpty();
    req.checkBody('password', 'Contraseña no ingresada').notEmpty();
    
    req.getValidationResult().then((result) => {
        if(!result.isEmpty()) {
            result.throw();
        }

        return User.findOne({username: req.body.username}).then((user) => {
            if(typeof user === 'undefined' || !user || !user.password) {
                throw new Error('Combinación usuario-contraseña incorrecta');
            }

            return bcrypt.compare(req.body.password, user.password).then((matches) => {
                if(!matches) {
                    throw new Error('Combinación usuario-contraseña incorrecta');
                }

                debug('User logged ' + req.body.username);
                sess.logged = true;
                sess.username = user.username;
                sess.userid = user._id;

                let token = jwt.sign({id: user._id}, config.cookieSecret, {
                    expiresIn: '1d'
                });
                res.cookie('accessToken', token, { httpOnly: true });
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

router.get('/session', function(req, res) {
    if(typeof req.session.logged === 'undefined') {
        req.session.logged = false;
    }

    let data = {
        logged: req.session.logged,
        username: req.session.username,
        userid: req.session.userid
    };

    res.json(data);
});

router.get('/sessiontest', jwtVerify, function(req, res, next) {
    res.json('ok');
});

module.exports = router;