var express = require('express');
var router = express.Router();

router.get('/panel', function(req, res, next) {
    if(!req.session.logged) {
        res.redirect('/');
        return;
    }

    res.render('panel', { title: 'Tracker Notifier' });
});

module.exports = router;
