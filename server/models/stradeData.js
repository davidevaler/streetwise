const mongoose = require('mongoose');

const StradeDataSchema = new mongoose.Schema({
    _id: Object,
    id: Number,
    nome: String,
    tratti: [Number],
    citta: Number
}, { collection: 'strade' });

module.exports = mongoose.model('StradeData', StradeDataSchema);