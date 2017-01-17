var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/', function(req, res, next) {
    let sess = req.session;
    if(sess.logged === true) {
        res.redirect('/panel');
    } else {
        res.render('login', { title: 'Tracker Notifier' });
    }
    
});

module.exports = router;
