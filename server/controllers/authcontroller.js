const User = require("../models/user"); // Importa il modello utente
const jwt = require("jsonwebtoken");    // Importa il pacchetto per gestire JWT

// Funzione per creare il token
const generateToken = (user) => {
  // Crea un token con payload = id e ruolo dell’utente
  return jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: "1d" // Il token scade dopo 1 giorno
  });
};

// Controller per login
exports.login = async (req, res) => {
  const { email, password } = req.body;  // Legge email e password dalla richiesta

  const user = await User.findOne({ email }); // Cerca utente nel DB
  if (!user || !(await user.matchPassword(password))) {
    // Se utente non trovato o password errata
    return res.status(401).json({ message: "Credenziali errate" });
  }

  // Se login ok, genera token
  const token = generateToken(user);

  // Risponde con token e dati utente (senza password!)
  res.json({
    token,
    user: {
      id: user._id,
      email: user.email,
      role: user.role
    }
  });
};
