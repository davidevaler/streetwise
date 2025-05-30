const express = require('express');
const router = express.Router();
const CittaData = require('../models/cittaData');


//config per ricerca SOLO su nome, ADD altro se serve
router.get('/', async (req, res) => {
    const {nome} = req.query;

    if (!nome) {
        return res.status(400).json({ error: "Specificare il campo 'nome'" });
    }

    try {
        const data = await CittaData.find({ nome: nome });
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;