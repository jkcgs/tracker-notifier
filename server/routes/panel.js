const path = require('path');
const express = require('express');
let router = express.Router();

router.get('/panel', function(req, res, next) {
    if(!req.session.logged) {
        res.redirect('/');
        return;
    }

    res.sendFile(path.join(__dirname, '..', '..', 'views', 'panel.html'));
});

module.exports = router;
