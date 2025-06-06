const express = require('express');
const router = express.Router();
const { generateToken, authenticate, login } = require('../controllers/authcontroller');
const { protect, authorizeRoles } = require('../controllers/authMiddleware');

// LOGIN - rotta pubblica
router.post('/login', login);

// LOGIN - rotta pubblica
router.post('/login-form', async (req, res) => {
  const { email, password } = req.body;
  try {
    const user = await authenticate(email, password);
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });
    
    req.session.toast = { type: 'success', message: 'Login effettuato con successo!'};
    
    if (user.role === 'admin') {
      console.log(process.env.CLIENT_URL);
      return res.redirect(`${process.env.CLIENT_URL}/admin`);
    } else {
      return res.redirect(`${process.env.CLIENT_URL}/dashboard`);
    }
  } catch (err) {
    console.error(err)
    req.session.toast = { type: 'error', message: 'Errore interno' };
    return res.redirect(process.env.CLIENT_URL);
  }
})

// ME - rotta protetta da token
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// ADMIN ONLY - protetta e autorizzata solo per admin
router.get('/admin-only', protect, authorizeRoles('admin'), (req, res) => {
  res.json({ message: 'Accesso admin autorizzato!' });
});

module.exports = router;