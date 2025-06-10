const express = require('express');
const router = express.Router();
const CorseData = require('../models/corseData');

router.get('/', async (req, res) => {
    const { citta, linea, ora_inizio, ora_fine } = req.query;

    if (!citta) {
        return res.status(400).json({ error: "Specificare il campo 'citta'" });
    }

    // Costruisco il filtro query dinamico
    let query = { citta: parseInt(citta) };

    if (linea) {
        query.linea = linea;
    }

    // Filtro orario (ora_partenza in intervallo)
    if (ora_inizio && ora_fine) {
        query.ora_partenza = { $gte: ora_inizio, $lte: ora_fine };
    } else if (ora_inizio) {
        query.ora_partenza = { $gte: ora_inizio };
    } else if (ora_fine) {
        query.ora_partenza = { $lte: ora_fine };
    }

    try {
        const data = await CorseData.find(query);
        res.json(data);
    } catch (err) {
        console.error('Errore nel recupero corse:', err);
        res.status(500).json({ error: 'Errore interno del server' });
    }
});

module.exports = router;