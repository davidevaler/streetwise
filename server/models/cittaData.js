const mongoose = require('mongoose');

const CittaDataSchema = new mongoose.Schema({
    _id: Object,
    id: Number,
    nome: String,
    pos: Object,
    zoom: Object,
    bounds: Object
}, { collection: 'citta' });

module.exports = mongoose.model('CittaData', CittaDataSchema);