const express = require('express');
const debug = require('debug')('tracker-notifier:user');
const request = require('request');
const simplepush = require('../simplepush');
const jwtVerify = require('../jwt-verify');
const User = require('../models/user');
let router = express.Router();
module.exports = router;

// Actualizar codigo SimplePush de un usuario
router.post('/user/setspcode', jwtVerify, function(req, res, next) {
    if(!req.body.code) {
        return next(new Error('Código nuevo no enviado'));
    }

    let userid = req.auth.id;
    User.findOneAndUpdate({_id: userid}, {$set: { spcode: req.body.code }}, {new: true},  (err, doc) => {
        if(err) {
            return next(err);
        }

        simplepush.send(doc.spcode, `¡${doc.username}, tu código ha sido actualizado!`, 'Tracker Notifier');

        debug(`User ${doc.username} changed its SimplePush.io code to ${doc.spcode}`);
        res.json({success: true, data: { code: doc.spcode }});
    });
});
