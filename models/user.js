const mongoose = require('mongoose');

let userSchema = mongoose.Schema({
    username: String,
    password: String
});

let User = mongoose.model('User', userSchema);
module.exports = User;