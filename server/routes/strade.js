const express = require('express');
const router = express.Router();
const StradeData = require('../models/StradeData');

router.get('/', async (req, res) => {
    const {citta} = req.query;
    if  (!citta) { return res.status(400).json({ error: "Specificare il campo 'nome'" }); }

    try {
        const data = await StradeData.find({ citta: citta });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;