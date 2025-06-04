const express = require('express');
const router = express.Router();

// Route principale per la mappa
router.get('/', (req, res) => {
  res.render('index');
});

// Route per la dashboard admin
router.get('/admin', (req, res) => {
  res.render('admin');
});

router.get('/segnala', (req, res) => {
  res.render('segnala');
});


module.exports = router;