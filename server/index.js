const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

// Cors - accetta richieste dal client React su localhost:3000
app.use(cors({
  origin: 'http://localhost:3000'
}));

app.use(express.static('public'));

// Parsing JSON body
app.use(bodyParser.json());

// Import rotta auth
const routeLogin = require('./routes/routeLogin');
app.use('/api/auth', routeLogin);

// Connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Database MongoDB Connesso...'))
  .catch(err => console.log(err));

// Porta da .env
const PORT = process.env.PORT || 5001; //su macOS è 5001, su Windows è 5000
app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));

// Rotta base per test
app.get('/', (req, res) => {
  res.send('Server is working');
});