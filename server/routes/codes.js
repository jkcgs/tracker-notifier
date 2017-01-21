const express = require('express');
const mongoose = require('mongoose');
const ObjectId = mongoose.Schema.Types.ObjectId;
let Item = require('../models/item');
let router = express.Router();

router.get('/codes', function(req, res, next) {
    //res.io.emit('hello', 'world');
    Item.find({user: req.session.userid}, (err, result) => {
        if(err) {
            res.status(500);
            res.render('error', {
                message: 'No se pudieron cargar los códigos',
                error: err
            });

            return;
        }

        res.json(result);
    });
});

router.post('/addcode', function(req, res) {
    if(!req.session.logged) {
        res.status(403);
        throw new Error('Sesión no iniciada');
    }

    if(!('code' in req.body)) {
        res.status(400);
        throw new Error('No se envió el código a agregar');
    }

    Item.findOne({user: req.session.userid, code: req.body.code}).then((result) => {
        if(result) {
            res.status(400);
            throw new Error('El código ya existe');
        }

        let item = new Item({
            code: req.body.code,
            provider: 'cl_correos',
            nextCheck: 0,
            currentStatus: '',
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

router.post('/delcode', function(req, res, next) {
    if(!req.session.logged) {
        res.status(403);
        throw new Error('Sesión no iniciada');
    }

    if(!('code' in req.body)) {
        res.status(400);
        throw new Error('No se envió el código a agregar');
    }

    Item.findOneAndRemove({code: req.body.code, user: req.session.userid}, (err, doc) => {
        if(err) {
            next(err);
            return;
        }

        res.json({success: true});
    });
});

module.exports = router;
