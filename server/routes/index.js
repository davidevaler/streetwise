const express = require('express');
const router = express.Router();

// AUtenticazione
const { protect, authorizeRoles } = require('../controllers/authMiddleware'); // Assicurati il percorso corretto

// pagina principale x utente non autenticato
router.get('/', (req, res) => {
    res.render('base', { error: null });
});


// pagina per utenti auth (Protetta - Richiede autenticazione)
router.get('/dashboard', protect, (req, res) => {
    res.render('dashboard', { user: req.user }); // Passa i dati dell'utente alla vista EJS
});

// pagina admin (Protetta - Richiede autenticazione e ruolo 'admin')
router.get('/admin', protect, authorizeRoles('admin'), (req, res) => {
    res.render('admin', { user: req.user }); // Renderizza il file admin_page.ejs
});

// logout
router.get('/logout', (req, res) => {
    res.clearCookie('token');           // Rimuovi il cookie JWT
    req.session.destroy((err) => {      // Distruggi anche la sessione
        if (err) {
            console.error('Errore durante la distruzione della sessione:', err);
            req.session.toast = { message: "Errore Log-out, riprova", tipo: "error" };
            return res.status(500).send('Errore logout');
        }
        res.redirect(process.env.CLIENT_URL_HTTPS);      // Reindirizza alla pagina base
    });
});

module.exports = router;
