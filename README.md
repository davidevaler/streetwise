# StreetWise

StreetWise è una piattaforma web per la gestione della mobilità urbana, pensata per fornire a cittadini e amministratori strumenti di visualizzazione, segnalazione e analisi dei dati di traffico, incidenti e trasporto pubblico.

---

## Links
- [Render](https://streetwise.onrender.com/)
- [Apiary](https://app.apiary.io/streetwise/)

---

## Caratteristiche principali

- **Mappa interattiva**: visualizzazione dei flussi di traffico, incidenti e fermate del trasporto pubblico tramite Leaflet.js.
- **Segnalazioni**: creazione, aggiornamento e cancellazione di segnalazioni (buche, ostacoli, incidenti).
- **Gestione segnalazioni**: assegnazione di priorità, monitoraggio dello stato e filtri per categoria.
- **Annunci informativi**: pubblicazione e programmazione di comunicazioni ufficiali.
- **Autenticazione e profili utente**: login, gestione JWT o sessioni, ruoli (Utente, Operatore, Admin).
- **Esportazione dati**: download dei dati in formato JSON per analisi esterne.

---

## Tecnologie

- **Backend**: Node.js, Express.js
- **Frontend**: EJS, HTML5, CSS3, JavaScript
- **Mappe**: Leaflet.js con API Open Data del Comune di Trento
- **Autenticazione**: JSON Web Token (JWT)
- **Database**: MongoDB

---

## Prerequisiti

- Node.js ≥ 14
- npm (incluso in Node.js)
- Browser (Chrome, Firefox, Edge, Safari)

---

## Installazione e avvio

1. Clona il repository:
   ```bash
   git clone https://github.com/davidevaler/streetwise.git
   cd streetwise
   ```
2. Installa le dipendenze del progetto principale:
   ```bash
   npm install
   ```
3. Installa e avvia il **server**:
   ```bash
   cd server
   npm install
   node index.js
   ```
4. Di default è possibile accedere all’applicazione via browser in locale su `https://localhost:3443/` oppure tramite Render su `https://streetwise.onrender.com/`.

---

## Struttura del progetto

```
streetwise/
├── .gitattributes
├── .gitignore
├── package-lock.json
├── package.json
├── README.md
└── server/                                 # Backend Express.js
    ├── .gitignore
    ├── controllers/                        # Logica e middleware
    │   ├── authcontroller.js
    │   └── authMiddleware.js
    ├── index.js                            # Punto di ingresso server
    ├── models/                             # Modelli dati
    │   ├── cittaData.js
    │   ├── comunicazioniData.js
    │   ├── corseData.js
    │   ├── fermateData.js
    │   ├── giuntiData.js
    │   ├── incidentiData.js
    │   ├── segnalazioniData.js
    │   ├── stradeData.js
    │   ├── trattiData.js
    │   └── user.js
    ├── package-lock.json
    ├── package.json
    ├── public/                             # Risorse statiche frontend
    │   ├── css/                            # Fogli di stile
    │   │   ├── admin.css
    │   │   ├── carousel.css
    │   │   ├── comunicazioni-admin.css
    │   │   ├── comunicazioni.css
    │   │   ├── error.css
    │   │   ├── footer.css
    │   │   ├── map.css
    │   │   ├── navbar.css
    │   │   ├── segnalazioni.css
    │   │   ├── sidebar.css
    │   │   ├── style.css
    │   │   └── toast.css
    │   ├── img/                            # Icone e favicon per PWA
    │   │   ├── android-chrome-192x192.png
    │   │   ├── android-chrome-512x512.png
    │   │   ├── apple-touch-icon.png
    │   │   ├── favicon-16x16.png
    │   │   ├── favicon-32x32.png
    │   │   ├── favicon.ico
    │   │   └── site.webmanifest
    │   └── js/                             # Script 
    │       ├── admin.js
    │       ├── auth/                       # Modulo autenticazione
    │       │   └── login.js
    │       ├── carousel.js
    │       ├── comunicazioni-admin.js
    │       ├── comunicazioni-delegati.js
    │       ├── map/                        # Funzionalità mappa
    │       │   ├── canvas-overlay.js
    │       │   ├── draw-tratti.js
    │       │   ├── leaflet-heat.js
    │       │   ├── main.js
    │       │   ├── map-loader.js
    │       │   ├── map-traffico.js
    │       │   ├── map-trasporti.js
    │       │   └── utils.js
    │       ├── navbar.js
    │       ├── segnalazioni.js
    │       └── toast.js
    ├── routes/                             # API REST
    │   ├── citta.js
    │   ├── comunicazioni.js
    │   ├── corse.js
    │   ├── fermate.js
    │   ├── giunti.js
    │   ├── incidenti.js
    │   ├── index.js
    │   ├── routeLogin.js
    │   ├── segnalazioni.js
    │   ├── strade.js
    │   ├── traffico.js
    │   ├── tratti.js
    │   └── users.js
    └── views/                              # Template EJS
        ├── admin/                          # Viste pannello admin
        │   └── index.ejs
        ├── base/
        │   └── index.ejs
        ├── dashboard/                      # Viste dashboard
        │   └── index.ejs
        ├── delegati/                       # Viste per delegati
        │   └── index.ejs
        ├── error.ejs
        ├── layouts/                        # Layout base
        │   └── default.ejs
        ├── partials/                       # Componenti riutilizzabili
        │   ├── comunicazioni.ejs
        │   ├── footer.ejs
        │   ├── map.ejs
        │   ├── navbar.ejs
        │   └── toast.ejs
        └── segnala/                        # Viste segnalazioni
            └── index.ejs
```

---

## Contatti

- **Alessandro Morelato**: [alessandro.morelato@studenti.unitn.it](mailto:alessandro.morelato@studenti.unitn.it)
- **Davide Valer**: [davide.valer@studenti.unitn.it](mailto:davide.valer@studenti.unitn.it)
- **Giacomo Saltori**: [giacomo.saltori-1@studenti.unitn.it](mailto:giacomo.saltori-1@studenti.unitn.it)

---

_Progetto realizzato per il corso di Ingegneria del Software 2024/2025 – Università di Trento_
