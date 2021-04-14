require('dotenv').config();

const crud = require('./databases/CRUD');
const express = require('express');
const app = express();
// const mongodb = require('./databases/mongodb');

//Rotas no qual será possivel realizar o CRUD

app.get('/add/:produto', crud.add)
app.get('/delete/:codigo', crud.delet)
app.get('/search/:codigo', crud.search)
app.get('/update/:codigo/:produto', crud.update)

// Rotas do MongoDB

app.get('/addClient/:nameClient/:cpfClient', crud.addClient)
app.get('/searchClient', crud.searchClient);

app.listen(process.env.SERVER_PORT, () => { 
    console.log(`O servidor esta rodando na URL http://localhost:${process.env.SERVER_PORT}`)
});