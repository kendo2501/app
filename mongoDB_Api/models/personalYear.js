const mongoose = require('mongoose');

const personalYearSchema = new mongoose.Schema({
    number: { type: String, required: true }, 
    information: { type: String, required: true }, 
},
{ collection: process.env.COLLECTION_NAME || 'personalYear' });


module.exports = mongoose.model('personalYear', personalYearSchema);