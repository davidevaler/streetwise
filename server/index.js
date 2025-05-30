const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config();

const CLIENT_URL = process.env.CLIENT_URL;
const PORT = process.env.PORT;

app.use(cors(
  {  origin: CLIENT_URL  }
));
app.use(express.static('public'));
// Parsing JSON body
app.use(bodyParser.json());


//connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Database MongoDB Connesso...'))
  .catch(err => console.log(err));


// Import rotta auth
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


app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));

app.get('/', (req, res) => {
  res.send('Server is working');
});
