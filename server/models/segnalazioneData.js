const mongoose = require('mongoose');

const SegnalazioneDataSchema = new mongoose.Schema({
    _id: {
        type: mongoose.Schema.Types.ObjectId,
        default: () => new mongoose.Types.ObjectId()
    },
    titolo: {
        type: String,
        required: true,
        trim: true
    },
    descrizione: {
        type: String,
        required: true,
        trim: true
    },
    email: {
        type: String,
        required: true,
        match: /^[\w\.%-]+@[\w\.-]+\.[A-Za-z]{2,}$/
    },
    coord: {
        type: {
            x: Number,
            y: Number
        },
        _id: false,
        required: true
    },
    dataCreazione: {
        type: Date,
        default: Date.now
    },
    stato: {
        type: String,
        enum: ['aperta', 'in_lavorazione', 'chiusa'],
        default: 'aperta'
    }
}, { collection: 'segnalazioni' });

module.exports = mongoose.model('SegnalazioneData', SegnalazioneDataSchema);