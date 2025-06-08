const express = require('express');
const router = express.Router();
const FermateData = require('../models/fermateData');

router.get('/', async (req, res) => {
    const { citta } = req.query;
    if (!citta) { 
        return res.status(400).json({ error: "Specificare il campo 'citta'" });
    }

    try {
        const data = await FermateData.find({ citta: parseInt(citta) });
        res.json(data);
    } catch (err) {
        console.error('Errore nel recupero fermate:', err);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;