const express = require('express');
const mongoose = require('mongoose');
const jwtVerify = require('../jwt-verify');
const ObjectId = mongoose.Schema.Types.ObjectId;
let Item = require('../models/item');
let router = express.Router();

router.get('/codes', jwtVerify, function(req, res, next) {
    Item.find({user: req.auth.id}, (err, result) => {
        if(err) {
            res.status(500);
            res.render('error', {
                message: 'No se pudieron cargar los códigos',
                error: err
            });

            return;
        }

        res.json({codes: result});
    });
});

router.post('/addcode', jwtVerify, function(req, res) {
    if(!('code' in req.body)) {
        res.status(400);
        throw new Error('No se envió el código a agregar');
    }

    Item.findOne({user: req.auth.id, code: req.body.code}).then((result) => {
        if(result) {
            res.status(400);
            throw new Error('El código ya existe');
        }

        let item = new Item({
            code: req.body.code,
            provider: 'cl_correos',
            nextCheck: 0,
            currentStatus: '',
            delivered: false,
            lastUpdate: new Date(),
            user: req.session.userid,
            altCodes: []
        });

        item.save((err, itemsaved) => {
            if(err) {
                throw err;
            }

            res.json(itemsaved);
        });
    });
});

router.post('/delcode', jwtVerify, function(req, res, next) {
    if(!('code' in req.body)) {
        res.status(400);
        throw new Error('No se envió el código a agregar');
    }

    Item.findOneAndRemove({code: req.body.code, user: req.auth.id}, (err, doc) => {
        if(err) {
            next(err);
            return;
        }

        res.json({success: true});
    });
});

module.exports = router;
