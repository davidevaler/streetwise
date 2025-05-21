const express = require('express');
const router = express.Router();
const authController = require('../controllers/authcontroller');
const { protect, authorizeRoles } = require('../controllers/authMiddleware');

// LOGIN - rotta pubblica, NO middleware protect
router.post('/login', authController.login);

// ME - rotta protetta da token
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// ADMIN ONLY - protetta e autorizzata solo per admin
router.get('/admin-only', protect, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Accesso admin autorizzato!' });
});

module.exports = router;