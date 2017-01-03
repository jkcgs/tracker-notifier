var express = require('express');
var router = express.Router();

/* GET home page. */
router.get('/codes', function(req, res, next) {
    res.io.emit('hello', 'world');
    res.json({
        lel: 'xd'
    });
});

module.exports = router;
