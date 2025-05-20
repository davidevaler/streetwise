const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const mongoose = require('mongoose');
require('dotenv').config();

const app = express();

const CLIENT_URL = process.env.CLIENT_URL;

app.use(cors({
  origin: CLIENT_URL
}));

app.use(express.static('public'));

//parsing JSON body
app.use(bodyParser.json());

//import rotta auth
const routeLogin = require('./routes/routeLogin');
app.use('/api/auth', routeLogin);

//connessione a MongoDB
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('Database MongoDB Connesso...'))
  .catch(err => console.log(err));

const PORT = process.env.PORT;
app.listen(PORT, () => console.log(`Server in ascolto sulla porta ${PORT}`));

//rotta base per test
app.get('/', (req, res) => {
  res.send('Server is working');
});

const giuntiRouter = require('./routes/giunti');
const stradeRouter = require('./routes/strade');
const trattiRouter = require('./routes/tratti');
const incidentiRouter = require('./routes/incidenti');

app.use(giuntiRouter);
app.use(stradeRouter);
app.use(trattiRouter);
app.use(incidentiRouter);