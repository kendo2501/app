const mongoose = require('mongoose');

const mainNumberSchema = new mongoose.Schema({
    number: { type: String, required: true }, 
    information: { type: String, required: true }, 
},
{ collection: process.env.COLLECTION_NAME || 'mainNumber' });


module.exports = mongoose.model('mainNumber', mainNumberSchema);