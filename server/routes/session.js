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
            let msg = result.useFirstErrorOnly().array()[0].msg;
            let e = new Error('Falló la validación de datos: ' + msg);
            e.status = 400;
            return next(e);
        }

        return User.findOne({username: req.body.username}).then((user) => {
            if(typeof user === 'undefined' || !user || !user.password) {
                let e = new Error('Combinación usuario-contraseña incorrecta');
                e.status = 401;
                return next(e);
            }

            return bcrypt.compare(req.body.password, user.password).then((matches) => {
                if(!matches) {
                    let e = new Error('Combinación usuario-contraseña incorrecta');
                    e.status = 401;
                    return next(e);
                }

                debug('User logged ' + req.body.username);
                sess.logged = true;
                sess.spcode = user.spcode;
                sess.username = user.username;
                sess.userid = user._id;
                sess.token = jwt.sign({id: user._id}, config.cookieSecret, {
                    expiresIn: '1d'
                });

                let ct = req.get('content-type');
                if(ct && ct.indexOf('json') > -1) {
                    res.json({
                        success: true,
                        token: sess.token
                    });
                } else {
                    res.cookie('accessToken', sess.token, { httpOnly: true });
                    res.redirect('/panel');
                }
                
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
        userid: req.session.userid,
        spcode: req.session.spcode,
        token: req.session.token
    };
    
    res.json(data);
});

router.get('/userinfo', jwtVerify, function(req, res, next) {
    User.findById(req.auth.id, (err, user) => {
        if(err) {
            return next(err);
        }

        res.json({
            username: user.username,
            id: user._id
        });
    });
});

router.get('/sessiontest', jwtVerify, function(req, res, next) {
    res.json({success: true});
});

module.exports = router;