const express = require('express');
const router = express.Router();
const User = require('../models/user');
const { requireAdmin } = require('../controllers/authMiddleware');

// GET - Ottieni tutti gli utenti (solo admin)
router.get('/', requireAdmin, async (req, res) => {
  try {
    const users = await User.find().select('-password'); // Escludi la password
    res.json(users);
  } catch (error) {
    console.error('Errore nel caricamento utenti:', error);
    res.status(500).render('error', { message: '500 - Errore interno del server', statusCode: 500 });
  }
});

// GET - Ottieni un singolo utente (solo admin)
router.get('/:id', requireAdmin, async (req, res) => {
  try {
    const user = await User.findById(req.params.id).select('-password');
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }
    res.json(user);
  } catch (error) {
    console.error('Errore nel caricamento utente:', error);
    res.status(500).render('error', { message: '500 - Errore interno del server', statusCode: 500 });
  }
});

// POST - Crea un nuovo utente (solo admin)
router.post('/', requireAdmin, async (req, res) => {
  try {
    const { email, password, role } = req.body;

    // Validazione
    if (!email || !password) {
      req.session.toast = {message: 'Email e password sono obbligatori', 'tipo': 'warning'};
      return res.status(400).json({ message: 'Email e password sono obbligatori' });
    }

    if (password.length < 8) {
      req.session.toast = {message: 'La password deve avere almeno 8 caratteri', 'tipo': 'warning'};
      return res.status(400).json({ message: 'La password deve avere almeno 8 caratteri' });
    }

    // Controlla se l'utente esiste già
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      req.session.toast = {message: "L'utente esiste già", 'tipo': 'warning'};
      return res.status(400).json({ message: 'Utente già esistente' });
    }

    // Crea nuovo utente
    const newUser = new User({
      email,
      password,
      role: role || 'delegato'
    });

    await newUser.save();

    // Restituisci utente senza password
    const userResponse = {
      _id: newUser._id,
      email: newUser.email,
      role: newUser.role
    };

    res.status(201).json(userResponse);
  } catch (error) {
    console.error('Errore nella creazione utente:', error);
    res.status(500).render('error', { message: '500 - Errore interno del server', statusCode: 500 });
  }
});

// PUT - Modifica un utente (solo admin)
router.put('/:id', requireAdmin, async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const userId = req.params.id;

    // Trova l'utente
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    // Aggiorna i campi
    if (email) user.email = email;
    if (role) user.role = role;
    if (password && password.length >= 8) {
      user.password = password; // Il middleware pre-save si occuperà dell'hash
    }

    await user.save();

    // Restituisci utente aggiornato senza password
    const userResponse = {
      _id: user._id,
      email: user.email,
      role: user.role
    };

    res.json(userResponse);
  } catch (error) {
    console.error('Errore nell\'aggiornamento utente:', error);
    res.status(500).render('error', { message: '500 - Errore interno del server', statusCode: 500 });
  }
});

// DELETE - Elimina un utente (solo admin)
router.delete('/:id', requireAdmin, async (req, res) => {
  try {
    const userId = req.params.id;

    // Non permettere all'admin di eliminare se stesso
    if (userId === req.user._id.toString()) {
      return res.status(400).json({ message: 'Non puoi eliminare il tuo stesso account' });
    }

    const user = await User.findByIdAndDelete(userId);
    if (!user) {
      return res.status(404).json({ message: 'Utente non trovato' });
    }

    res.json({ message: 'Utente eliminato con successo' });
  } catch (error) {
    console.error('Errore nell\'eliminazione utente:', error);
    res.status(500).render('error', { message: '500 - Errore interno del server', statusCode: 500 });
  }
});

module.exports = router;