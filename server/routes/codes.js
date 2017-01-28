const express = require('express');
const mongoose = require('mongoose');
const jwtVerify = require('../jwt-verify');
const debug = require('debug')('tracker-notifier:codes');
const ObjectId = mongoose.Schema.Types.ObjectId;
let Item = require('../models/item');
let providers = require('../providers');
let router = express.Router();

router.get('/codes', jwtVerify, function(req, res, next) {
    debug('cargando codigos usuario ' + req.auth.id);
    Item.find({users: req.auth.id}, (err, result) => {
        if(err) {
            return next(err);
        }

        res.json({codes: result});
    });
});

router.post('/addcode', jwtVerify, function(req, res, next) {
    if(!('code' in req.body)) {
        return res.sendError('No se envió el código a agregar', 400);
    }

    if(!('provider' in req.body)) {
        return res.sendError('No se envió el proveedor del rastreo', 400);
    }

    if(!providers.exists(req.body.provider)) {
        return res.sendError('El proveedor no existe', 400);
    }

    Item.findOne({code: req.body.code}).then((item) => {
        if(item) {
            let hasUser = item.users.some(function (user) {
                return user.equals(req.auth.id);
            });

            if(hasUser) {
                return res.sendError('El código ya existe', 400);
            } else {
                item.users.push(req.auth.id);
                return item.save((err, itemsaved) => {
                    if(err) {
                        throw err;
                    }

                    res.json(itemsaved);
                });
            }
        }

        let itemNew = new Item({
            code: req.body.code,
            provider: req.body.provider,
            nextCheck: 0,
            currentStatus: '',
            delivered: false,
            lastUpdate: new Date(),
            user: req.auth.id,
            altCodes: []
        });

        itemNew.save((err, itemsaved) => {
            if(err) {
                throw err;
            }

            res.json(itemsaved);
        });
    }).catch((err) => next(err));
});

router.post('/delcode', jwtVerify, function(req, res, next) {
    if(!('code' in req.body)) {
        res.status(400);
        throw new Error('No se envió el código a eliminar');
    }

    Item.findOne({code: req.body.code, users: req.auth.id}, (err, doc) => {
        if(err) {
            next(err);
            return;
        }

        if(doc.users.length > 1) {
            doc.update({$pullAll: {users: [req.auth.id] }}, (err2) => {
                if(err2) {
                    return next(err2);
                }
                res.json({success: true});
            });
        } else {
            doc.remove((err2) => {
                if(err2) {
                    return next(err2);
                }
                res.json({success: true});
            });
        }
    });
});

router.get('/providers', jwtVerify, function(req, res, next) {
    res.json(providers.getList());
});

module.exports = router;
