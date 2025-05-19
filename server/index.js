const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config();

const routeLogin = require("./routes/routeLogin");
app.use("/api/auth", routeLogin); 

app.use(cors(
    {
        origin: 'http://localhost:3000'
    }
)) // per connettersi dal client
app.use(bodyParser.json()) // converti le richieste in JSON

mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log('Database MongoDB Connesso...'))
    .catch((err) => console.log(err))

const stradeRoutes = require('./routes/strade');
app.use('/api/strade', stradeRoutes);

const giuntiRoutes = require('./routes/giunti');
app.use('/api/giunti', giuntiRoutes);

const trattiRoutes = require('./routes/tratti');
app.use('/api/tratti', trattiRoutes);

app.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`))
app.get('/', (req, res) => {
  res.send('Server is working');
});




