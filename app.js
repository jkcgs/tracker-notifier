const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const debug = require('debug')('tracker-notifier:app');
const expressValidator = require('express-validator');
const mongoose = require('mongoose');

let config = require('./config.json');
let db = require('./server/database');

const app = express();
const server = require('http').Server(app);
const io = require('socket.io')(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hbs');

// uncomment after placing your favicon in /public
//app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(expressValidator());
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static('./node_modules/angular/'));
app.use(express.static('./node_modules/bootstrap/dist/'));
app.use(express.static('./node_modules/jquery/dist/'));
app.use(express.static('./node_modules/tether/dist/'));
app.use(express.static('./node_modules/font-awesome/'));

// Append socket to res in event loop
app.use(function(req, res, next){
    res.io = io;
    next();
});

// Setup session
let store = new MongoDBStore({
    uri: config.dburi,
    collection: 'sessions'
});

store.on('error', function(error) {
    assert.ifError(error);
    assert.ok(false);
});

app.use(session({ 
    secret: config.cookieSecret, 
    resave: true,
    saveUninitialized: false,
    store: store
}));

// Cargar módulos
require('./server/loader')(app);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
    var err = new Error('Not Found');
    err.status = 404;
    next(err);
});

// error handler
app.use(function(err, req, res, next) {
    // set locals, only providing error in development
    let dev = req.app.get('env') === 'development';
    res.locals.message = err.message;
    res.locals.error = dev ? err : {};

    // render the error page
    res.status(err.status || 500);
    let ct = req.get('content-type');
    if(ct && ct.indexOf('json') > -1) {
        let details = {
            success: false,
            message: err.message
        };
        if(dev) {
            details.stack = err.stack;
        }

        res.json(details);        
    } else {
        res.render('error');
    }
});

module.exports = {app: app, server: server};
