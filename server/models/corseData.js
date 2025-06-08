const mongoose = require('mongoose');

const CorseDataSchema = new mongoose.Schema({
    _id: Object,
    data: String,
    linea: String,
    ora_partenza: String,
    ora_arrivo: String,
    fermata: Object,
    salita: Number,
    citta: Number,
}, { collection: 'corsa' });

module.exports = mongoose.model('Corse', CorseDataSchema);