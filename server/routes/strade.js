const express = require('express');
const router = express.Router();
const StradeData = require('../models/StradeData');

router.get('/api/strade', async (req, res) => {
    try {
        const data = await StradeData.find({});
        res.json(data);
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
});

module.exports = router;