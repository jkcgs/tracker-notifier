const config = require('../config.json');
const jwtVerify = require('express-jwt');

let verif = jwtVerify({
    secret: config.cookieSecret,
    requestProperty: 'auth',
    getToken: function (req) {
        let auth = req.headers.authorization;
        let cookie = req.cookies.accessToken;
        if (auth && auth.split(' ')[0] === 'Bearer') {
            return auth.split(' ')[1];
        } else if (cookie) {
            return cookie;
        }
        
        return null;
    },
    isRevoked: function(req, payload, done) {
        let revoked = (req.session.userid && (req.session.userid+'' !== payload.id+''));
        done(null, revoked);
    }
});

module.exports = verif;