const mongoose = require('mongoose');

const birthDescriptionSchema = new mongoose.Schema({
    number: { type: String, required: true }, 
    description: { type: String, required: true }, 
},
{ collection: process.env.COLLECTION_NAME || 'birthDescription' });



module.exports = mongoose.model('birthDescription', birthDescriptionSchema);