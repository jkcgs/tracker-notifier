const mongoose = require('mongoose');

let itemSchema = mongoose.Schema({
    code: String,
    provider: String,
    nextCheck: Date,
    currentStatus: String,
    lastUpdate: Date,
    userId: [{ type: mongoose.Schema.Types.ObjectId, ref: 'User' }]
});

let Item = mongoose.model('Item', itemSchema);
module.exports = Item;