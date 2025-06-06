const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const app = express();
const mongoose = require('mongoose');
const cors = require('cors'); // Anche se non strettamente necessario per l'unica origine, non fa male
const path = require('path');
require('dotenv').config();

// Imposta CLIENT_URL e PORT dal .env
const CLIENT_URL = process.env.CLIENT_URL || `http://localhost:${process.env.PORT || 3000}`; // Fallback sicuro
const PORT = process.env.PORT || 3000; // Porta predefinita se non specificata

app.use(cors({  
  origin: CLIENT_URL,   
  credentials: true     //necessaria per la gestione cookies
}));

//configura la gestione client
app.use(express.static(path.join(__dirname, 'public')));
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
//usando layouts andiamo a iniettare il codice delle varie pagine dentro a layouts/default.ejs
app.use(expressLayouts);
app.set('layout', 'layouts/default'); // Imposta il layout di default per tutte le pagine

// Parsing del body delle richieste (POST/PUT)
// gestiamo comunicazioni in diversi formati: json (fetch), form, cookies
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());

/* 
* Configurazione della sessione
* Utilizzo un sistema di sessione x user in modo da 
* gestire autenticazioni e altri dati sensibili sul lato server
* per avere una applicazione più sicura
*/
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true solo in HTTPS quindi in produzione
    httpOnly: true,         // Non accessibile tramite JavaScript lato client x motivi di sicurezza
    maxAge: 1000 * 60 * 60  // 1 ora
  }
}));

// Middleware per le notifiche //finire implementazione
app.use((req, res, next) => {
  res.locals.toast = req.session.toast;
  delete req.session.toast;
  next();
});


//connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Database MongoDB Connesso...'))
  .catch(err => console.error('Errore di connessione a MongoDB: ', err));

// Import e utilizzo delle route API
const routeLogin = require('./routes/routeLogin');
app.use('/api/auth', routeLogin);

const cittaRoutes = require('./routes/citta');
app.use('/api/citta', cittaRoutes);

const usersRoutes = require('./routes/users');
app.use('/api/users', usersRoutes);

const stradeRoutes = require('./routes/strade');
app.use('/api/strade', stradeRoutes);

const giuntiRoutes = require('./routes/giunti');
app.use('/api/giunti', giuntiRoutes);

const trattiRoutes = require('./routes/tratti');
app.use('/api/tratti', trattiRoutes);

const incidentiRoutes = require('./routes/incidenti');
app.use('/api/incidenti', incidentiRoutes);

const trafficoRoutes = require('./routes/traffico');
app.use('/api/traffico', trafficoRoutes);


//Gestione delle routes per le pagine EJS
const viewsRouter = require('./routes/index');
app.use('/', viewsRouter);  //Tutte le richieste non API

//gestione errori
app.use((req, res, next) => {
  res.status(404).render('error', { message: '404 - Pagina non trovata' });
});

//gestione altr errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: '500 - Errore interno del server' });
});

//Avvio server
app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));
