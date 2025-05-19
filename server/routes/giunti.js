const express = require('express');
const router = express.Router();
const GiuntiData = require('../models/giuntiData');

router.get('/', async (req, res) => {
    try {
        const data = await GiuntiData.find({});
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;