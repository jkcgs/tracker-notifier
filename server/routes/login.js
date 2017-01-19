const path = require('path');
const express = require('express');
let router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    let sess = req.session;
    if (sess.logged === true) {
        res.redirect('/panel');
    } else {
        res.sendFile(path.join(__dirname, '..', '..', 'views', 'login.html'));
    }
    
});

module.exports = router;
