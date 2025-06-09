const mongoose = require('mongoose');

const GiuntiDataSchema = new mongoose.Schema({
    _id: Object,
    id: Number,
    coord: Object,
    tipoGiunto: String,
    trattiCollegati: [Number],
    citta: Number
}, { collection: 'giunti' });

module.exports = mongoose.model('giuntiData', GiuntiDataSchema);