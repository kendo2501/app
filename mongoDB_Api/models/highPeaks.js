const mongoose = require('mongoose');

const highPeaksSchema = new mongoose.Schema({
    number: { type: String, required: true }, 
    information: { type: String, required: true }, 
},
{ collection: process.env.COLLECTION_NAME || 'highPeaks' });


module.exports =  mongoose.model('highPeaks', highPeaksSchema);