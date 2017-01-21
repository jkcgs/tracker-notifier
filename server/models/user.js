const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username: String,
    password: String,
    spcode: String // SimplePush key
});

let User = mongoose.model('User', userSchema);
module.exports = User;