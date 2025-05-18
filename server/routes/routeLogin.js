const express = require("express");
const router = express.Router();
const { protect, authorizeRoles } = require("../controllers/authMiddleware");

// Ritorna i dati dell'utente loggato (protetta da token)
router.get("/me", protect, (req, res) => {
  res.json({ user: req.user }); // Dati dell’utente estratti dal token
});

// Rotta accessibile solo se l'utente ha ruolo "admin"
router.get("/admin-only", protect, authorizeRoles("admin"), (req, res) => {
  res.json({ message: "Accesso admin autorizzato!" });
});

module.exports = router;
