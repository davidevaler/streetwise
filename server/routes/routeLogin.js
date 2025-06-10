const express = require('express');
const router = express.Router();
const { generateToken, authenticate, login } = require('../controllers/authcontroller');
const { protect, authorizeRoles } = require('../controllers/authMiddleware');

// LOGIN - rotta pubblica
router.post('/login-form', async (req, res) => {
  const { email, password } = req.body;
  try {
    let user;
    try { 
      user = await authenticate(email, password); }
    catch(error) {
      //Autenticazione non andata a buon fine
      req.session.toast = { 
        message: "Autenticazione non riuscita",
        tipo: "error"
      };
      return res.redirect('/');

    }
    const token = generateToken(user);

    res.cookie('token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      maxAge: 3600000
    });
    
    req.session.toast = { tipo: 'success', message: 'Login effettuato con successo!'};
    
    if (user.role === 'admin') {
      return res.redirect(`/admin`);
    } else {
      return res.redirect(`/dashboard`);
    }
 
  } catch (err) {
    console.error(err)
    req.session.toast = { tipo: 'error', message: 'Errore interno' };
    return res.redirect('/');
  }
})

// ME - rotta protetta da token
router.get('/me', protect, (req, res) => {
  res.json({ user: req.user });
});

// ADMIN ONLY - protetta e autorizzata solo per admin
router.get('/admin-only', protect, authorizeRoles('admin'), (req, res) => {
  req.session.toast = { tipo: 'success', message: 'Accesso admin autorizzato!' };
  next();
});

module.exports = router;
