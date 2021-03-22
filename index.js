require('dotenv').config();
const express = require('express');
const redis = require('./database/redis');

const app = express();


app.listen(process.env.PORT, () => { 
    console.log(`Server listening on port ${process.env.PORT}`); 
});