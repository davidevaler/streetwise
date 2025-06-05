const mongoose = require('mongoose');

const IncidentiDataSchema = new mongoose.Schema({
    _id: Object,
    anno: Number,
    coord: Object,
    citta: Number
}, { collection: 'incidenti' });

module.exports = mongoose.model('IncidentiData', IncidentiDataSchema);
