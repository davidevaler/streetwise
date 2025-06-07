const express = require('express');
const router = express.Router();
const multer = require('multer');
const Comunicazione = require('../models/comunicazioniData');
const { requireAdmin } = require('../controllers/authMiddleware');

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

// GET - Recupera tutte le comunicazioni ordinate per data (pubblico)
router.get('/', async (req, res) => {
  try {
    const comunicazioni = await Comunicazione
      .find()
      .select('titolo descrizione dataCreazione email')
      .sort({ dataCreazione: -1 })
      .limit(50);
    res.json({
      success: true,
      data: comunicazioni
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

// GET - Recupera le comunicazioni più recenti (pubblico)
router.get('/recenti', async (req, res) => {
  try {
    const limite = parseInt(req.query.limite) || 10;
    const comunicazioni = await Comunicazione
      .find()
      .select('titolo descrizione dataCreazione')
      .sort({ dataCreazione: -1 })
      .limit(limite);
    res.json({
      success: true,
      data: comunicazioni
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

// GET - Recupera una comunicazione specifica (pubblico)
router.get('/:id', async (req, res) => {
  try {
    const comunicazione = await Comunicazione.findById(req.params.id);
    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }
    res.json({
      success: true,
      data: comunicazione
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

// GET - Recupera tutte le comunicazioni per admin (con più dettagli)
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

// POST - Crea una nuova comunicazione (solo admin)
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
        dimensione: all.dati.length
      }))
    };

    res.status(201).json({
      success: true,
      data: comunicazioneRisposta,
      message: 'Comunicazione creata con successo'
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

// PUT - Modifica una comunicazione esistente (solo admin)
router.put('/admin/:id', requireAdmin, upload.array('allegati', 5), async (req, res) => {
  try {
    const { titolo, descrizione, email, mantieni_allegati } = req.body;
    const comunicazioneId = req.params.id;

    // Trova la comunicazione esistente
    const comunicazione = await Comunicazione.findById(comunicazioneId);
    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    // Validazione
    if (titolo !== undefined) comunicazione.titolo = titolo.trim();
    if (descrizione !== undefined) comunicazione.descrizione = descrizione.trim();
    if (email !== undefined) {
      const emailRegex = /^[\w\.%-]+@[\w\.-]+\.[A-Za-z]{2,}$/;
      if (!emailRegex.test(email)) {
        return res.status(400).json({
          success: false,
          message: 'Formato email non valido'
        });
      }
      comunicazione.email = email.trim().toLowerCase();
    }

    // Gestione allegati
    if (mantieni_allegati !== 'true') {
      // Sostituisci tutti gli allegati
      comunicazione.allegati = [];
    }

    // Aggiungi nuovi allegati se presenti
    if (req.files && req.files.length > 0) {
      req.files.forEach(file => {
        comunicazione.allegati.push({
          nomeFile: file.originalname,
          contentType: file.mimetype,
          dati: file.buffer
        });
      });
    }

    await comunicazione.save();

    // Restituisci senza i dati binari
    const comunicazioneRisposta = {
      _id: comunicazione._id,
      titolo: comunicazione.titolo,
      descrizione: comunicazione.descrizione,
      email: comunicazione.email,
      dataCreazione: comunicazione.dataCreazione,
      allegati: comunicazione.allegati.map(all => ({
        nomeFile: all.nomeFile,
        contentType: all.contentType,
        dimensione: all.dati.length
      }))
    };

    res.json({
      success: true,
      data: comunicazioneRisposta,
      message: 'Comunicazione aggiornata con successo'
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

// DELETE - Elimina una comunicazione (solo admin)
router.delete('/admin/:id', requireAdmin, async (req, res) => {
  try {
    const comunicazioneId = req.params.id;

    const comunicazione = await Comunicazione.findByIdAndDelete(comunicazioneId);
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

// GET - Download allegato (solo admin)
router.get('/admin/:id/allegato/:allegatoIndex', requireAdmin, async (req, res) => {
  try {
    const { id, allegatoIndex } = req.params;
    const index = parseInt(allegatoIndex);

    const comunicazione = await Comunicazione.findById(id);
    if (!comunicazione) {
      return res.status(404).json({
        success: false,
        message: 'Comunicazione non trovata'
      });
    }

    if (index < 0 || index >= comunicazione.allegati.length) {
      return res.status(404).json({
        success: false,
        message: 'Allegato non trovato'
      });
    }

    const allegato = comunicazione.allegati[index];
    
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