const mongoose = require('mongoose');

const FermateDataSchema = new mongoose.Schema({
    _id: Object,
    nome: String,
    coord: {
        x: Number,
        y: Number
    },
    citta: Number,
}, { collection: 'fermate' });

module.exports = mongoose.model('FermateData', FermateDataSchema);