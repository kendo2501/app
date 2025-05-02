const mongoose = require('mongoose');

const chartSchema = new mongoose.Schema({
    number: { type: String, required: true }, 
    information: { type: String, required: true }, 
},
{ collection: process.env.COLLECTION_NAME || 'chart' });



module.exports = mongoose.model('chart', chartSchema);