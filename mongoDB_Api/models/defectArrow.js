const mongoose = require('mongoose');

const defectArrowSchema = new mongoose.Schema({
    arrow: { type: String, required: true }, 
    defect: { type: String, required: true }, 
},
{ collection: process.env.COLLECTION_NAME || 'defectArrow' });



module.exports = mongoose.model('defectArrow', defectArrowSchema);