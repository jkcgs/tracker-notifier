const prompt = require('prompt');
const bcrypt = require('bcrypt');

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
            return;
        }

        bcrypt.hash(result.password, 10, (err, hash) => {
            if(err) {
                throw err;
            }

            console.log('Hash: ' + hash);
        });
    }
);