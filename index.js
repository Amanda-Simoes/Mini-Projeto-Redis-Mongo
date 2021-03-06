require('dotenv').config();

const crud = require('./databases/CRUD');
const express = require('express');
const app = express();
// const mongodb = require('./databases/mongodb');

//Rotas no qual será possivel realizar o CRUD

app.get('/add/:produto/:valor', crud.add)
app.get('/delete/:codigo', crud.delet)
app.get('/search/:codigo', crud.search)
app.get('/update/:codigo/:produto', crud.update)

// Rotas do MongoDB

app.get('/addClient/:nameClient/:cpfClient', crud.addClient)
app.get('/searchClient/:cpfClient', crud.searchClient);
app.get('/deleteClient/:cpfClient', crud.deleteClient);
app.get('/updateClient/:nameClient/:newName', crud.updateClient)

// Rota para os pedidos

app.get('/pedidoClient/:cpfClient/:produto/:quant', crud.pedidos)

app.listen(process.env.SERVER_PORT, () => { 
    console.log(`O servidor esta rodando na URL http://localhost:${process.env.SERVER_PORT}`)
});