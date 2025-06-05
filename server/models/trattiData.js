const mongoose = require('mongoose');

const TrattiDataSchema = new mongoose.Schema({
    _id: Object,
    id: Number,
    start: Number,
    end: Number,
    idStrada: Number,
    citta: Number
}, { collection: 'tratti' });

module.exports = mongoose.model('TrattiData', TrattiDataSchema);