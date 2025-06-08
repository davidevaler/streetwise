const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const express = require('express');
const https = require('https');
const http  = require('http');
const fs  = require('fs');
const expressLayouts = require('express-ejs-layouts');
const session = require('express-session');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
require('dotenv').config();

// Imposta CLIENT_URL e PORT dal .env
const app = express();
const CLIENT_URL = process.env.CLIENT_URL_HTTPS || `https://localhost:${process.env.PORT_HTTPS || 3443}`;
const CLIENT_URL_HTTP = process.env.CLIENT_URL_HTTP || `http://localhost:${process.env.PORT || 3000}`; // Fallback sicuro
const PORT_HTTP = process.env.PORT_HTTP || 3000; // Porta predefinita se non specificata
const PORT = process.env.PORT_HTTPS || 3443       //Ports 

app.use(cors({  
  origin: CLIENT_URL,   
  credentials: true     //necessaria per la gestione cookies
}));

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
  secret: process.env.SESSION_SECRET,
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
  res.status(404).render('error', { message: '404 - Pagina non trovata', statusCode: 404 });
});

//gestione altr errori
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).render('error', { message: '500 - Errore interno del server', statusCode: 500 });
});

//creazione e avvio server https
let privateKey, certificate, caBundle;

/*
* Per avviare il server https servono le chiavi e l'autocertificazione generate
* con OpenSSL. 
* Il browser potrebbe notificare che il certificato non è sicuro
* Ma va bene così, infatti è auto-generato; In seguito si 
* potrà passare ad un certificato vero
*/
try {
  privateKey = fs.readFileSync(path.join(__dirname, 'ssl', 'key.pem'), 'utf8');
  certificate = fs.readFileSync(path.join(__dirname, 'ssl', 'cert.pem'), 'utf8');
  //caBundle = fs.readFileSync(path.join(__dirname, 'ssl', 'ca_bundle.crt'), 'utf8'); => servirà con un sistema vero

} catch (err) {
  console.error("Errore nella lettura dei file SSL: ", err);
  process.exit(1);
}

const credenziali = {
  key: privateKey,
  cert:certificate,
  //ca: caBundle      => come prima
};

const httpsServer = https.createServer(credenziali, app);

httpsServer.listen(PORT, () => {
  console.log(`Server HTTPS in ascolto sulla porta ${PORT}`);
});


/*
* Avvio server http per reindirizzamento
* Questa parte è temporanea, con un server vero passeremo ad 
* un sistema di 'reverse proxy' che si occuperà di gestire 
* la connesione in modo più sicuro e veloce
*/
const httpServer = http.createServer((req, res) => {
  // Controlla se la richiesta è già HTTPS, se sì non fa nulla
  if (req.secure) {
    return app(req, res);
  }

  //redirect semplice all'URL base https
  const redirectUrl = process.env.CLIENT_URL_HTTPS;
  res.writeHead(301, { "Location": redirectUrl });
  res.end();
  console.log(`Reindirizzamento HTTP: ${req.url} -> ${redirectUrl}`);
});


httpServer.listen(PORT_HTTP, () => console.log(`Server in ascolto sulla porta ${PORT_HTTP}`));
