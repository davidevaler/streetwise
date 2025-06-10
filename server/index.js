const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const mongoose = require('mongoose');
const path = require('path');
require('dotenv').config();

// Imposta CLIENT_URL e PORT dal .env
const app = express();

// process.env.PORT viene fornito da Render.Add commentMore actions
const PORT = process.env.PORT || 3000;            // Porta predefinita di sicurezza
const CLIENT_URL = process.env.CLIENT_URL_HTTPS;  // url Render


//configura la gestione client
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
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
  secret: process.env.SESSION_SECRET, // IMPORTANTE: Deve essere una variabile d'ambiente su Render
  store: MongoStore.create({
    mongoUrl: process.env.MONGO_URI, 
    ttl: 60 * 60 
  }),
  SameSite: 'Strict',
  resave: false,
  saveUninitialized: false,
  cookie: {
    secure: process.env.NODE_ENV === 'production', // true solo in HTTPS
    httpOnly: true,         // Non accessibile tramite JavaScript lato client x motivi di sicurezza
    maxAge: 1000 * 60 * 60  // 1 ora
  }
}));

// Middleware per le notifiche //finire implementazione
app.use((req, res, next) => {
  res.locals.toast = req.session.toast;
  if (!(req.session.toast)) {
    req.session.toast = {
      message: '',
      tipo: 'invisible',
    };
  }
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
app.use('/api/user', usersRoutes);

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

const comunicazioniRoutes = require('./routes/comunicazioni');
app.use('/api/comunicazioni', comunicazioniRoutes);

const segnalazioniRoutes = require('./routes/segnalazioni');
app.use('/api/segnalazioni', segnalazioniRoutes);


//Gestione delle routes per le pagine EJS
const viewsRouter = require('./routes/index');
app.use('/', viewsRouter);  //Tutte le richieste non API

//gestione errori
app.use((req, res, next) => {
  res.status(404).render('error', { message: '404 - Pagina non trovata', statusCode: 404 });
});

//gestione altr errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: '500 - Errore interno del server', statusCode: 500 });
});

//  Non serve più la gestione per SSL perchè se ne occupa render
// Fa il compito di una  reverse proxy (credo)

// Avvio del server unico (HTTP interno)
// Render inoltra il traffico HTTPS esterno a questa porta HTTP interna
app.listen(PORT, () => {
  console.log(`Server Express in ascolto sulla porta ${PORT}`);
  console.log(`L'applicazione sarà accessibile pubblicamente via HTTPS all'URL: ${CLIENT_URL || 'Non definito (impostare CLIENT_URL_HTTPS in .env/Render)'}`);
});
