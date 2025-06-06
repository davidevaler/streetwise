const jwt = require('jsonwebtoken');
const User = require('../models/user');

/*
* Middleware per verificare il token JWT (protect)
* se JWT è valido, aggiunge i dati dell'utente a req.user
*/
const protect = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token mancante' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Utente non trovato' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token non valido' });
  }
};

/*
*  Middleware per autorizzare ruoli specifici
*  se il ruolo dell'utente è in roles => prosegui
*  else: blocca
*/
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: 'Utente non autenticato' });
    }
    
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ 
        message: `Accesso negato. Ruolo richiesto: ${roles.join(' o ')}` 
      });
    }
    
    next();
  };
};

// Middleware specifico per verificare che l'utente sia admin
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');
    
    if (!token) {
      return res.status(401).json({ message: 'Token mancante' });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      return res.status(401).json({ message: 'Utente non trovato' });
    }

    if (user.role !== 'admin') {
      return res.status(403).json({ message: 'Accesso negato. Solo admin.' });
    }

    req.user = user;
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token non valido' });
  }
};

module.exports = { 
  protect, 
  authorizeRoles, 
  requireAdmin 
};