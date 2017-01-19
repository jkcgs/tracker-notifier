const mongoose = require('mongoose');

let itemSchema = mongoose.Schema({
    code: String,
    provider: String,
    nextCheck: Number,
    currentStatus: String,
    lastUpdate: Date,
    user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
    altCodes: [String]
});

let Item = mongoose.model('Item', itemSchema);
module.exports = Item;