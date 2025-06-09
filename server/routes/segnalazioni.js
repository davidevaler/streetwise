const express = require('express');
const router = express.Router();
const SegnalazioniData = require('../models/segnalazioniData');

// GET - Ottieni tutte le segnalazioni (per admin)
router.get('/', async (req, res) => {
    try {
        const segnalazioni = await SegnalazioniData.find().sort({ dataCreazione: -1 });
        res.json(segnalazioni);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore del server' });
    }
});

// POST - Crea una nuova segnalazione
router.post('/', async (req, res) => {
    const { titolo, descrizione, email, coord } = req.body;

    // Validazione input
    if (!titolo || !descrizione || !email || !coord || !coord.x || !coord.y) {
        return res.status(400).json({ 
            error: "Tutti i campi sono obbligatori (titolo, descrizione, email, coord)" 
        });
    }

    // Validazione coordinate
    if (!isFinite(coord.x) || !isFinite(coord.y)) {
        return res.status(400).json({ 
            error: "Le coordinate devono essere valori numerici validi" 
        });
    }

    try {
        const nuovaSegnalazione = new SegnalazioniData({
            titolo: titolo.trim(),
            descrizione: descrizione.trim(),
            email: email.trim().toLowerCase(),
            coord: {
                x: parseFloat(coord.x),
                y: parseFloat(coord.y)
            }
        });

        const segnalazioneSalvata = await nuovaSegnalazione.save();
        res.status(201).json({
            message: 'Segnalazione creata con successo',
            segnalazione: segnalazioneSalvata
        });
    } catch (err) {
        console.error('Errore nella creazione della segnalazione:', err);
        
        if (err.name === 'ValidationError') {
            res.status(400).json({ 
                error: 'Dati non validi: ' + err.message 
            });
        } else {
            res.status(500).json({ 
                error: 'Errore del server nella creazione della segnalazione' 
            });
        }
    }
});

// PUT - Aggiorna stato segnalazione (per admin)
router.put('/:id', async (req, res) => {
    const { stato } = req.body;
    
    if (!['aperta', 'in_lavorazione', 'chiusa'].includes(stato)) {
        return res.status(400).json({ 
            error: "Lo stato deve essere: aperta, in_lavorazione o chiusa" 
        });
    }

    try {
        const segnalazione = await SegnalazioniData.findByIdAndUpdate(
            req.params.id,
            { stato },
            { new: true }
        );

        if (!segnalazione) {
            return res.status(404).json({ error: 'Segnalazione non trovata' });
        }

        res.json({
            message: 'Stato segnalazione aggiornato',
            segnalazione
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Errore del server' });
    }
});

module.exports = router;