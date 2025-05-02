const mongoose = require('mongoose');

const advantageArrowSchema = new mongoose.Schema({
  arrow: { type: String, required: true }, 
  advantage: { type: String, required: true }, 
},
{ collection: process.env.COLLECTION_NAME || 'advantageArrow' });



module.exports = mongoose.model('advantageArrow', advantageArrowSchema);