// models/mandala.js
const mongoose = require('mongoose');

const MandalaSchema = new mongoose.Schema({
    number: { type: String, required: true },
    information: { type: String, required: true },
}, {
    collection: process.env.COLLECTION_NAME || 'mandala'
});

module.exports = mongoose.model('mandala', MandalaSchema);