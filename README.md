# StreetWise

StreetWise è una piattaforma web per la gestione della mobilità urbana, pensata per fornire a cittadini e amministratori strumenti di visualizzazione, segnalazione e analisi dei dati di traffico, incidenti e trasporto pubblico.

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
4. Installa e avvia il **client**:
   ```bash
   cd ../client
   npm install
   node app.js
   ```
5. Di default è possibile accedere all’applicazione via browser su `http://localhost:3000`.

---

## Struttura del progetto

```
streetwise/
├── .gitattributes
├── .gitignore
├── client/                                 # Frontend (EJS, CSS, JS)
│   ├── .gitignore
│   ├── app.js                              # Punto di ingresso client
│   ├── package-lock.json
│   ├── package.json                        # Dipendenze front-end
│   ├── public/                             # Risorse statiche
│   │   ├── css/
│   │   │   ├── admin.css                   # Stili per il pannello admin
│   │   │   └── style.css
│   │   ├── img/                            # Icone e favicon per PWA/mobile
│   │   │   ├── android-chrome-192x192.png
│   │   │   ├── android-chrome-512x512.png
│   │   │   ├── apple-touch-icon.png
│   │   │   ├── favicon-16x16.png
│   │   │   ├── favicon-32x32.png
│   │   │   ├── favicon.ico
│   │   │   └── site.webmanifest
│   │   └── js/                             # Script lato client
│   │       ├── auth/                       # Modulo autenticazione separato
│   │       │   └── login.js                # Logica login (separata)
│   │       ├── config.js
│   │       └── map/
│   │           ├── canvas-overlay.js
│   │           ├── draw-tratti.js
│   │           ├── main.js
│   │           ├── map-loader.js
│   │           └── utils.js
│   ├── routes/
│   │   └── index.js
│   └── views/
│       ├── admin.ejs                       # Vista pannello amministrativo
│       └── index.ejs
├── package-lock.json
├── package.json
├── README.md
└── server/                                 # Backend (Express.js)
    ├── .gitignore
    ├── controllers/                        # Logica e middleware
    │   ├── authcontroller.js
    │   └── authMiddleware.js
    ├── incidenti.json
    ├── index.js                            # Punto di ingresso server
    ├── models/
    │   ├── giuntiData.js
    │   ├── incidentiData.js
    │   ├── stradeData.js
    │   ├── trattiData.js
    │   └── user.js
    ├── package-lock.json
    ├── package.json
    └── routes/                             # API REST
        ├── giunti.js
        ├── incidenti.js
        ├── routeLogin.js
        ├── strade.js
        ├── tratti.js
        └── users.js                        # Nuove API per gestione utenti
```

---

## Contatti

- **Alessandro Morelato**: [alessandro.morelato@studenti.unitn.it](mailto:alessandro.morelato@studenti.unitn.it)
- **Davide Valer**: [davide.valer@studenti.unitn.it](mailto:davide.valer@studenti.unitn.it)
- **Giacomo Saltori**: [giacomo.saltori-1@studenti.unitn.it](mailto:giacomo.saltori-1@studenti.unitn.it)

---

_Progetto realizzato per il corso di Ingegneria del Software 2024/2025 – Università di Trento_
