const express = require('express');
const router = express.Router();
const Comunicazione = require('../models/comunicazioniData');

// GET - Recupera tutte le comunicazioni ordinate per data
router.get('/', async (req, res) => {
  try {
    const comunicazioni = await Comunicazione
      .find()
      .select('titolo descrizione dataCreazione email')
      .sort({ dataCreazione: -1 })
      .limit(50);

    res.json({
      success: true,
      data: comunicazioni
    });
  } catch (error) {
    console.error('Errore nel recupero delle comunicazioni:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// GET - Recupera le comunicazioni più recenti (limite da query string)
router.get('/recenti', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;

    const comunicazioni = await Comunicazione
      .find()
      .select('titolo descrizione dataCreazione')
      .sort({ dataCreazione: -1 })
      .limit(limite);

    res.json({
      success: true,
      data: comunicazioni
    });
  } catch (error) {
    console.error('Errore nel recupero delle comunicazioni recenti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// GET - Recupera una comunicazione specifica
router.get('/:id', async (req, res) => {
  try {
    const comunicazione = await Comunicazione.findById(req.params.id);

    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    res.json({
      success: true,
      data: comunicazione
    });
  } catch (error) {
    console.error('Errore nel recupero della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

module.exports = router;
