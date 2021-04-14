const client = require("./redis")
const poll = require("./postgres")
const pool = require("./postgres")
const mongodb = require("./mongodb");
const { request, response } = require("express");

//Adicionar Item
const add = (request, response) => {

    //Consulta
    const query = 'INSERT INTO Item (nome) VALUES ($1)'

    const item = [request.params.produto]

    poll.query(query, item, (err, res) => {
        if (err) throw err;
        //Informando se deu certo a consulta ou não (1 - TRUE e 0 - FALSE)
        console.log(`${res.command} ${res.rowCount}`)
        response.status(200).json({ query: `${res.command} ${res.rowCount}` })
    })
}

//Deletar Item
const delet = (request, response) => {

    //Consulta
    const query = 'DELETE FROM Item WHERE codigo = ($1)'

    const item = [request.params.codigo]

    poll.query(query, item, (err, res) => {
        if (err) throw err;
        //Informando se deu certo a consulta ou não (1 - TRUE e 0 - FALSE)
        console.log(`${res.command} ${res.rowCount}`)
        response.status(200).json({ query: `${res.command} ${res.rowCount}` })
    })
}

//Atualizar um item pelo seu codigo (Passando primeiro o codigo e depois o nome como mostra no index.)
const update = (request, response) => {

    //Consulta
    const query = 'UPDATE Item SET nome = ($1) WHERE codigo = ($2)'

    //Pegando o nome e o codigo
    const item = [request.params.produto , request.params.codigo] 

    poll.query(query, item, (err, res) => {
        if (err) throw err;
        //Informando se deu certo a consulta ou não (1 - TRUE e 0 - FALSE)
        console.log(`${res.command} ${res.rowCount}`)
        response.status(200).json({ query: `${res.command} ${res.rowCount}` })
    })
}

//Pesquisa nos bancos.
const search = (request, response) => {

    const item = [request.params.codigo]

    client.get(item, function(err, reply){
        if(reply != null){
            console.log("Produto encontrado no banco REDIS!")
            //Mostrando o item encontrado
            console.log(item);
            response.status(200).json([{item: parseInt(item), nome: reply}])
        }else{
            //Consulta
            pool.query('SELECT * FROM Item WHERE codigo = ($1)', item, (err, results) => {
                if (err) {
                    throw err;
                }
                else if(results.rows.length > 0){
                    console.log('O produto foi encontrado no banco Postgres!')
                    response.status(200).json(results.rows)
                    client.setex(results.rows[0].codigo,3600,results.rows[0].nome , (err,res) => {
                        if(err) throw err;
                        console.log('O produto foi encontrado no banco do postgres e foi adicionado no banco redis com tempo de 60minutos(1 hora)')
                    })
                }else{
                    response.status(400).json({error:"Produto não encontrado em nenhum banco"})
                }
                
            })
        }
    });
}

// CRUD UTILIZANDO O BANCO DE DADOS MONGODB

// Adicionando cliente
const addClient = async(request,response) =>{
    const client = {
        nameClient: request.params.nameClient,
        cpfClient: request.params.cpfClient,
        pedidos: []

    }
    try{
        const person = mongodb.db(`${process.env.MONGO_DATABASE}`).collection('client');
        await person.insertOne(client).then(() => {
            response.send('Cliente inserido com sucesso!')
        }).catch((err) => {
            response.send(err)
        })
    }finally{
        await mongodb.close();
    }
}

// const searchClient = async() =>{
//     try{
//         const db = mongodb.db(`${process.env.MONGO_DATABASE}`).collection('client');
//         const person = db.collection('client');

//         const filter = {cpfCliente: request.params.cpfClient}
//         await person.find('filter').forEach(p => console.log(p));
//     }finally{
//         await mongodb.close();
//     }
// }

//Exportando tudo
module.exports={add,delet,update,search,addClient}
