const express = require('express');
const router = express.Router();
const IncidentiData = require('../models/incidentiData');

router.get('/', async (req, res) => {
    try {
        const data = await IncidentiData.find({});
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;