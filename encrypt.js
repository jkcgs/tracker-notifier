var prompt = require('prompt');
var bcrypt = require('bcrypt');
prompt.start();
prompt.get(
    [{
        name: 'password',
        hidden: true
    }, {
        name: 'repeat',
        hidden: true
    }],
    function (err, result) {
        if(result.password !== result.repeat) {
            console.log('No coinciden');
        } else {
            bcrypt.hash(result.password, 10, function(err, hash) {
                if(err) {
                    throw err;
                }
                console.log('Hash: ' + hash);
            });
        }
    }
);