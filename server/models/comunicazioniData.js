const mongoose = require('mongoose');

const allegatoSchema = new mongoose.Schema({
  nomeFile: {
    type: String,
    required: true
  },
  contentType: {
    type: String,
    required: true
  },
  dati: {
    type: Buffer,
    required: true
  }
});

const comunicazioneSchema = new mongoose.Schema({
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
    trim: true,
    lowercase: true
  },
  allegati: [allegatoSchema],
  dataCreazione: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
  collection: 'comunicazioni'  // Forza il nome della collection esatta
});

// Indice per ordinare per data
comunicazioneSchema.index({ dataCreazione: -1 });

const Comunicazione = mongoose.model('Comunicazione', comunicazioneSchema);

module.exports = Comunicazione;
