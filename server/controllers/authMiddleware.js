const jwt = require("jsonwebtoken");
const User = require("../models/user");

// Middleware per proteggere le rotte
const protect = async (req, res, next) => {
  const authHeader = req.headers.authorization; // Legge header Authorization

  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    // Se manca o non inizia con "Bearer", accesso negato
    return res.status(401).json({ message: "Accesso negato. Nessun token." });
  }

  const token = authHeader.split(" ")[1]; // Estrae solo il token, escludendo la parola "Bearer"

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET); // Decodifica il token
    req.user = await User.findById(decoded.id).select("-password"); // Recupera l’utente dal DB (senza password)
    next(); // Passa alla funzione successiva
  } catch (err) {
    res.status(401).json({ message: "Token non valido" });
  }
};

// Middleware per controllare ruolo dell'utente (admin, delegato, ...)
const authorizeRoles = (...roles) => {
  return (req, res, next) => {
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({ message: "Accesso non autorizzato" });
    }
    next();
  };
};

module.exports = { protect, authorizeRoles };
