const bodyParser = require('body-parser')
const express = require('express')
const app = express()
const mongoose = require('mongoose')
const cors = require('cors')
require('dotenv').config();

app.use(cors(
    {
        origin: 'http://localhost:5173'
    }
)) // to allow cross origin requests
app.use(bodyParser.json()) // to convert the request into JSON
//
mongoose
    .connect(process.env.MONGO_URI, {})
    .then(() => console.log('MongoDB database Connected...'))
    .catch((err) => console.log(err))

app.listen(process.env.PORT, () => console.log(`App listening at http://localhost:${process.env.PORT}`))
app.get('/', (req, res) => {
  res.send('Server is working');
});



