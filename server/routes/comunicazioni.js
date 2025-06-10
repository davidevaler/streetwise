const express = require('express');
const multer = require('multer');
const router = express.Router();
const Comunicazione = require('../models/comunicazioniData');
const { protect, authorizeRoles, requireAdmin, requireDelegato, requireAdminOrDelegato } = require('../controllers/authMiddleware');

// Configurazione multer per gestire gli allegati
const storage = multer.memoryStorage();
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 10 * 1024 * 1024, // 10MB per file
    files: 5 // Massimo 5 file
  },
  fileFilter: (req, file, cb) => {
    // Tipi di file consentiti
    const allowedTypes = [
      'application/pdf',
      'image/jpeg',
      'image/png',
      'image/gif',
      'application/msword',
      'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      'text/plain'
    ];
    
    if (allowedTypes.includes(file.mimetype)) {
      cb(null, true);
    } else {
      cb(new Error('Tipo di file non supportato'), false);
    }
  }
});

// ===== ROTTE PUBBLICHE =====

// GET /recenti - Comunicazioni recenti per utenti non autenticati
router.get('/recenti', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;

    const comunicazioni = await Comunicazione
      .find()
      .select('titolo descrizione dataCreazione allegati')
      .sort({ dataCreazione: -1 })
      .limit(limite);

    // Converti i Buffer degli allegati in base64 per il frontend
    const comunicazioniConAllegati = comunicazioni.map(com => {
      const comunicazioneObj = com.toObject();
      
      if (comunicazioneObj.allegati && comunicazioneObj.allegati.length > 0) {
        comunicazioneObj.allegati = comunicazioneObj.allegati.map(allegato => ({
          nomeFile: allegato.nomeFile,
          contentType: allegato.contentType,
          dati: {
            base64: allegato.dati.toString('base64')
          }
        }));
      }
      
      return comunicazioneObj;
    });

    res.json({
      success: true,
      data: comunicazioniConAllegati
    });
  } catch (error) {
    console.error('Errore nel recupero delle comunicazioni recenti:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// GET / - Lista generale delle comunicazioni
router.get('/', async (req, res) => {
  try {
    const comunicazioni = await Comunicazione
      .find()
      .select('titolo descrizione dataCreazione email allegati')
      .sort({ dataCreazione: -1 })
      .limit(50);

    // Converti i Buffer degli allegati in base64 per il frontend
    const comunicazioniConAllegati = comunicazioni.map(com => {
      const comunicazioneObj = com.toObject();
      
      if (comunicazioneObj.allegati && comunicazioneObj.allegati.length > 0) {
        comunicazioneObj.allegati = comunicazioneObj.allegati.map(allegato => ({
          nomeFile: allegato.nomeFile,
          contentType: allegato.contentType,
          dati: {
            base64: allegato.dati.toString('base64')
          }
        }));
      }
      
      return comunicazioneObj;
    });

    res.json({
      success: true,
      data: comunicazioniConAllegati
    });
  } catch (error) {
    console.error('Errore nel recupero delle comunicazioni:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// GET /:id - Dettaglio singola comunicazione
router.get('/:id', async (req, res) => {
  try {
    const comunicazione = await Comunicazione.findById(req.params.id);

    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    // Converti la comunicazione in oggetto e trasforma gli allegati
    const comunicazioneObj = comunicazione.toObject();
    
    if (comunicazioneObj.allegati && comunicazioneObj.allegati.length > 0) {
      comunicazioneObj.allegati = comunicazioneObj.allegati.map(allegato => ({
        nomeFile: allegato.nomeFile,
        contentType: allegato.contentType,
        dati: {
          base64: allegato.dati.toString('base64')
        }
      }));
    }

    res.json({
      success: true,
      data: comunicazioneObj
    });
  } catch (error) {
    console.error('Errore nel recupero della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// ===== ROTTE ADMIN =====

// GET /admin/all - Recupera tutte le comunicazioni per admin
router.get('/admin/all', requireAdmin, async (req, res) => {
  try {
    const comunicazioni = await Comunicazione
      .find()
      .sort({ dataCreazione: -1 });
    
    // Rimuovi i dati binari degli allegati per la lista
    const comunicazioniSicure = comunicazioni.map(com => ({
      _id: com._id,
      titolo: com.titolo,
      descrizione: com.descrizione,
      email: com.email,
      dataCreazione: com.dataCreazione,
      allegati: com.allegati.map(all => ({
        nomeFile: all.nomeFile,
        contentType: all.contentType,
        dimensione: all.dati ? all.dati.length : 0
      }))
    }));
    
    res.json({
      success: true,
      data: comunicazioniSicure
    });
  } catch (error) {
    console.error('Errore nel recupero delle comunicazioni admin:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// POST /admin - Crea una nuova comunicazione (solo admin)
router.post('/admin', requireAdmin, upload.array('allegati', 5), async (req, res) => {
  try {
    const { titolo, descrizione, email } = req.body;

    // Validazione
    if (!titolo || !descrizione || !email) {
      return res.status(400).json({
        success: false,
        message: 'Titolo, descrizione ed email sono obbligatori'
      });
    }

    // Validazione email
    const emailRegex = /^[\w\.%-]+@[\w\.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato email non valido'
      });
    }

    // Prepara gli allegati
    const allegati = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        allegati.push({
          nomeFile: file.originalname,
          contentType: file.mimetype,
          dati: file.buffer
        });
      });
    }

    // Crea la comunicazione
    const nuovaComunicazione = new Comunicazione({
      titolo: titolo.trim(),
      descrizione: descrizione.trim(),
      email: email.trim().toLowerCase(),
      allegati
    });

    await nuovaComunicazione.save();

    // Restituisci senza i dati binari
    const comunicazioneRisposta = {
      _id: nuovaComunicazione._id,
      titolo: nuovaComunicazione.titolo,
      descrizione: nuovaComunicazione.descrizione,
      email: nuovaComunicazione.email,
      dataCreazione: nuovaComunicazione.dataCreazione,
      allegati: nuovaComunicazione.allegati.map(all => ({
        nomeFile: all.nomeFile,
        contentType: all.contentType,
        dimensione: all.dati ? all.dati.length : 0
      }))
    };

    res.status(201).json({
      success: true,
      message: 'Comunicazione creata con successo',
      data: comunicazioneRisposta
    });
  } catch (error) {
    console.error('Errore nella creazione della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// PUT /admin/:id - Modifica una comunicazione esistente (solo admin)
router.put('/admin/:id', requireAdmin, upload.array('allegati', 5), async (req, res) => {
  try {
    const { titolo, descrizione, email, mantieni_allegati } = req.body;

    // Validazione
    if (!titolo || !descrizione || !email) {
      return res.status(400).json({
        success: false,
        message: 'Titolo, descrizione ed email sono obbligatori'
      });
    }

    // Validazione email
    const emailRegex = /^[\w\.%-]+@[\w\.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato email non valido'
      });
    }

    // Trova la comunicazione esistente
    const comunicazioneEsistente = await Comunicazione.findById(req.params.id);
    if (!comunicazioneEsistente) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    // Prepara gli allegati
    let allegati = [];
    
    // Mantieni allegati esistenti se richiesto
    if (mantieni_allegati === 'true') {
      allegati = [...comunicazioneEsistente.allegati];
    }
    
    // Aggiungi nuovi allegati
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        allegati.push({
          nomeFile: file.originalname,
          contentType: file.mimetype,
          dati: file.buffer
        });
      });
    }

    // Aggiorna la comunicazione
    const comunicazioneAggiornata = await Comunicazione.findByIdAndUpdate(
      req.params.id,
      {
        titolo: titolo.trim(),
        descrizione: descrizione.trim(),
        email: email.trim().toLowerCase(),
        allegati
      },
      { new: true }
    );

    // Restituisci senza i dati binari
    const comunicazioneRisposta = {
      _id: comunicazioneAggiornata._id,
      titolo: comunicazioneAggiornata.titolo,
      descrizione: comunicazioneAggiornata.descrizione,
      email: comunicazioneAggiornata.email,
      dataCreazione: comunicazioneAggiornata.dataCreazione,
      allegati: comunicazioneAggiornata.allegati.map(all => ({
        nomeFile: all.nomeFile,
        contentType: all.contentType,
        dimensione: all.dati ? all.dati.length : 0
      }))
    };

    res.json({
      success: true,
      message: 'Comunicazione aggiornata con successo',
      data: comunicazioneRisposta
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// DELETE /admin/:id - Elimina una comunicazione (solo admin)
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const comunicazione = await Comunicazione.findByIdAndDelete(req.params.id);

    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Comunicazione eliminata con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// GET /admin/:id/allegato/:index - Download allegato per admin
router.get('/admin/:id/allegato/:index', requireAdmin, async (req, res) => {
  try {
    const comunicazione = await Comunicazione.findById(req.params.id);
    
    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    const allegatoIndex = parseInt(req.params.index);
    const allegato = comunicazione.allegati[allegatoIndex];

    if (!allegato) {
      return res.status(404).json({
        success: false,
        message: 'Allegato non trovato'
      });
    }

    res.set({
      'Content-Type': allegato.contentType,
      'Content-Disposition': `attachment; filename="${allegato.nomeFile}"`
    });

    res.send(allegato.dati);
  } catch (error) {
    console.error('Errore nel download dell\'allegato:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// ===== ROTTE DELEGATI =====

// GET /delegati/all - Recupera tutte le comunicazioni per delegati
router.get('/delegati/all', requireDelegato, async (req, res) => {
  try {
    const comunicazioni = await Comunicazione
      .find()
      .sort({ dataCreazione: -1 });
    
    // Rimuovi i dati binari degli allegati per la lista
    const comunicazioniSicure = comunicazioni.map(com => ({
      _id: com._id,
      titolo: com.titolo,
      descrizione: com.descrizione,
      email: com.email,
      dataCreazione: com.dataCreazione,
      allegati: com.allegati.map(all => ({
        nomeFile: all.nomeFile,
        contentType: all.contentType,
        dimensione: all.dati ? all.dati.length : 0
      }))
    }));
    
    res.json({
      success: true,
      data: comunicazioniSicure
    });
  } catch (error) {
    console.error('Errore nel recupero delle comunicazioni delegati:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// POST /delegati - Crea una nuova comunicazione (solo delegati)
router.post('/delegati', requireDelegato, upload.array('allegati', 5), async (req, res) => {
  try {
    const { titolo, descrizione, email } = req.body;

    // Validazione
    if (!titolo || !descrizione || !email) {
      return res.status(400).json({
        success: false,
        message: 'Titolo, descrizione ed email sono obbligatori'
      });
    }

    // Validazione email
    const emailRegex = /^[\w\.%-]+@[\w\.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato email non valido'
      });
    }

    // Prepara gli allegati
    const allegati = [];
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        allegati.push({
          nomeFile: file.originalname,
          contentType: file.mimetype,
          dati: file.buffer
        });
      });
    }

    // Crea la comunicazione
    const nuovaComunicazione = new Comunicazione({
      titolo: titolo.trim(),
      descrizione: descrizione.trim(),
      email: email.trim().toLowerCase(),
      allegati
    });

    await nuovaComunicazione.save();

    // Restituisci senza i dati binari
    const comunicazioneRisposta = {
      _id: nuovaComunicazione._id,
      titolo: nuovaComunicazione.titolo,
      descrizione: nuovaComunicazione.descrizione,
      email: nuovaComunicazione.email,
      dataCreazione: nuovaComunicazione.dataCreazione,
      allegati: nuovaComunicazione.allegati.map(all => ({
        nomeFile: all.nomeFile,
        contentType: all.contentType,
        dimensione: all.dati ? all.dati.length : 0
      }))
    };

    res.status(201).json({
      success: true,
      message: 'Comunicazione creata con successo',
      data: comunicazioneRisposta
    });
  } catch (error) {
    console.error('Errore nella creazione della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// PUT /delegati/:id - Modifica una comunicazione esistente (solo delegati)
router.put('/delegati/:id', requireDelegato, upload.array('allegati', 5), async (req, res) => {
  try {
    const { titolo, descrizione, email, mantieni_allegati } = req.body;

    // Validazione
    if (!titolo || !descrizione || !email) {
      return res.status(400).json({
        success: false,
        message: 'Titolo, descrizione ed email sono obbligatori'
      });
    }

    // Validazione email
    const emailRegex = /^[\w\.%-]+@[\w\.-]+\.[A-Za-z]{2,}$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({
        success: false,
        message: 'Formato email non valido'
      });
    }

    // Trova la comunicazione esistente
    const comunicazioneEsistente = await Comunicazione.findById(req.params.id);
    if (!comunicazioneEsistente) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    // Prepara gli allegati
    let allegati = [];
    
    // Mantieni allegati esistenti se richiesto
    if (mantieni_allegati === 'true') {
      allegati = [...comunicazioneEsistente.allegati];
    }
    
    // Aggiungi nuovi allegati
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        allegati.push({
          nomeFile: file.originalname,
          contentType: file.mimetype,
          dati: file.buffer
        });
      });
    }

    // Aggiorna la comunicazione
    const comunicazioneAggiornata = await Comunicazione.findByIdAndUpdate(
      req.params.id,
      {
        titolo: titolo.trim(),
        descrizione: descrizione.trim(),
        email: email.trim().toLowerCase(),
        allegati
      },
      { new: true }
    );

    // Restituisci senza i dati binari
    const comunicazioneRisposta = {
      _id: comunicazioneAggiornata._id,
      titolo: comunicazioneAggiornata.titolo,
      descrizione: comunicazioneAggiornata.descrizione,
      email: comunicazioneAggiornata.email,
      dataCreazione: comunicazioneAggiornata.dataCreazione,
      allegati: comunicazioneAggiornata.allegati.map(all => ({
        nomeFile: all.nomeFile,
        contentType: all.contentType,
        dimensione: all.dati ? all.dati.length : 0
      }))
    };

    res.json({
      success: true,
      message: 'Comunicazione aggiornata con successo',
      data: comunicazioneRisposta
    });
  } catch (error) {
    console.error('Errore nell\'aggiornamento della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// DELETE /delegati/:id - Elimina una comunicazione (solo delegati)
router.delete('/delegati/:id', requireDelegato, async (req, res) => {
  try {
    const comunicazione = await Comunicazione.findByIdAndDelete(req.params.id);

    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    res.json({
      success: true,
      message: 'Comunicazione eliminata con successo'
    });
  } catch (error) {
    console.error('Errore nell\'eliminazione della comunicazione:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

// GET /delegati/:id/allegato/:index - Download allegato per delegati
router.get('/delegati/:id/allegato/:index', requireDelegato, async (req, res) => {
  try {
    const comunicazione = await Comunicazione.findById(req.params.id);
    
    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    const allegatoIndex = parseInt(req.params.index);
    const allegato = comunicazione.allegati[allegatoIndex];

    if (!allegato) {
      return res.status(404).json({
        success: false,
        message: 'Allegato non trovato'
      });
    }

    res.set({
      'Content-Type': allegato.contentType,
      'Content-Disposition': `attachment; filename="${allegato.nomeFile}"`
    });

    res.send(allegato.dati);
  } catch (error) {
    console.error('Errore nel download dell\'allegato:', error);
    res.status(500).json({
      success: false,
      message: 'Errore interno del server',
      error: error.message
    });
  }
});

module.exports = router;