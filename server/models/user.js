const mongoose = require("mongoose");    // Importa mongoose per definire il modello
const bcrypt = require("bcryptjs");      // Importa bcrypt per criptare le password

// Definisce lo schema dell'utente
const userSchema = new mongoose.Schema({
  email: {
    type: String,                        // Il campo email è una stringa
    required: true,                      // È obbligatorio
    unique: true,                        // Deve essere univoco nel DB
    match: /^[\w\.%-]+@[\w\.-]+\.[A-Za-z]{2,}$/ // Deve rispettare un formato email valido
  },
  password: {
    type: String,                        // Il campo password è una stringa
    required: true,                      // È obbligatoria
    minlength: 8                         // Deve avere almeno 8 caratteri
  },
  role: {
    type: String,                        // Il ruolo è una stringa
    enum: ["delegato", "admin"], // Può essere solo uno di questi due
    default: "delegato"                    // Di default è "delegato"
  }
});

userSchema.pre("save", async function (next) {
  // Se la password NON è stata modificata, passa oltre
  if (!this.isModified("password")) return next();

  // Altrimenti, genera hash della password
  this.password = await bcrypt.hash(this.password, 10); // 10 è il saltRounds
  next();
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema, "utenti"); 
