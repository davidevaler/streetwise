const express = require('express');
const router = express.Router();
const TrattiData = require('../models/trattiData');

router.get('/', async (req, res) => {
    try {
        const data = await TrattiData.find({});        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;