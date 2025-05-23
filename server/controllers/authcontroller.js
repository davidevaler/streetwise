const User = require("../models/user");
const jwt = require("jsonwebtoken");

// Funzione per creare il token JWT
const generateToken = (user) => {
  return jwt.sign(
    { id: user._id, role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: "1d" }
  );
};

// Controller per il login
exports.login = async (req, res) => {
  console.log("login() chiamato - body ricevuto:", req.body);  // <-- DEBUG

  const { email, password } = req.body;

  try {
    const user = await User.findOne({ email });

    if (!user) {
      console.log("Utente non trovato");
      return res.status(404).json({ message: "Utente non trovato" });
    }

    const passwordMatch = await user.matchPassword(password);
    if (!passwordMatch) {
      console.log("Password errata");
      return res.status(401).json({ message: "Password errata" });
    }

    const token = generateToken(user);
    console.log("Login OK, token generato");

    return res.json({
      token,
      user: {
        id: user._id,
        email: user.email,
        role: user.role,
      },
    });

  } catch (error) {
    console.error("Errore nel login:", error);
    return res.status(500).json({ message: "Errore del server" });
  }
};