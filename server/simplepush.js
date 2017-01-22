const request = require('request');
const url = 'https://api.simplepush.io/send/';
module.exports = {
    send: function(code, message, title) {
        code = encodeURIComponent(code);
        message = encodeURIComponent(message);
        let dest = `${url}${code}/${message}`;

        if(typeof title !== 'undefined') {
            title = encodeURIComponent(title);
            dest = `${url}${code}/${title}/${message}`;
        }

        request(dest);
    }
};