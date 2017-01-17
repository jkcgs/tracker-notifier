var express = require('express');
var router = express.Router();

router.get('/codes', function(req, res, next) {
    res.io.emit('hello', 'world');
    res.json({
        lel: 'xd'
    });
});

module.exports = router;
