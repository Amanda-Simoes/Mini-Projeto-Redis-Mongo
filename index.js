require('dotenv').config();
const express = required('express');
const cors = require('cors');
const redis = require('./databases/redis')

const app = express();
app.use(cors());

app.listen(process.env.PORT, () => {
    console.log('Servidor conectado')
})