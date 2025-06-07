const jwt = require('jsonwebtoken');
const User = require('../models/user');

/*
* Middleware per verificare il token JWT (protect)
* se JWT è valido, aggiunge i dati dell'utente a req.user
*/
const protect = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      req.session.toast = { message: "Non sei autenticato", tipo: "warning"};
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {      
      req.session.toast = { message: "Utente non trovato", tipo: "warning"};
    }
    req.user = user;
    next();
  } catch (error) {
    req.session.toast = { message: "Non sei autenticato", tipo: "error"};
  }
};

/*
*  Middleware per autorizzare ruoli specifici
*  se il ruolo dell'utente è in roles => prosegui
*  else: blocca
*/
const authorizeRoles = (...roles) => {
  return async (req, res, next) => {
    const token = req.cookies.token;
    if (!token) {
      req.session.toast = { message: "Non sei autenticato", tipo: "warning"};
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      req.session.toast = { message: "Utente non riconosciuto", tipo: "warning"};
    }
    
    if (!roles.includes(user.role)) {
      req.session.toast = { 
        tipo: "warning",
        message: `Accesso negato. Ruolo richiesto: ${roles.join(' o ')}` 
      };
    }
    
    next();
  };
};

// Middleware specifico per verificare che l'utente sia admin
const requireAdmin = async (req, res, next) => {
  try {
    const token = req.cookies.token;
    
    if (!token) {
      req.session.toast = { message: "Non sei autenticato", tipo: "warnig"};
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id);

    if (!user) {
      req.session.toast = { message: "Utente non riconosciuto", tipo: "warning"};
    }

    if (user.role !== 'admin') {
      req.session.toast = { message: "Accesso negato, non sei Admin", tipo: "warning"};
    }

    req.user = user;
    next();
  } catch (error) {
    req.session.toast = { message: "Non sei autenticato", tipo: "warning"};
  }
};

module.exports = { 
  protect, 
  authorizeRoles, 
  requireAdmin 
};