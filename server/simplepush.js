const request = require('request');
const User = require('./models/user');
const debug = require('debug')('tracker-notifier:simplepush');
const url = 'https://api.simplepush.io/send/';

module.exports = {
    send: send,
    sendToUser: sendToUser
};

function send(code, message, title) {
    code = encodeURIComponent(code);
    message = encodeURIComponent(message);
    let dest = `${url}${code}/${message}`;

    if(typeof title !== 'undefined') {
        title = encodeURIComponent(title);
        dest = `${url}${code}/${title}/${message}`;
        debug(`${code} <- ${title} - ${message}`);
    } else {
        debug(`${code} <- ${message}`);
    }

    request(dest);
}

function sendToUser(userid, message, title) {
    User.findById(userid, (err, doc) => {
        if(err || !doc.spcode) {
            return;
        }

        debug(`userid ${userid} code ${doc.spcode}`);
        send(doc.spcode, message, title);
    });
}