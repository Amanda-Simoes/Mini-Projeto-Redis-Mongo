const client = require("./redis")
const poll = require("./postgres")
const pool = require("./postgres")
const mongodb = require("./mongodb");
const { request, response } = require("express");

//Adicionar Item
const add = (request, response) => {

    //Consulta
    const query = 'INSERT INTO Item (nome, valor) VALUES ($1, $2)'

    const item = [request.params.produto, request.params.valor]
    // const preco = [request.params.valor]

    poll.query(query, item,  (err, res) => {
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
        response.send(err);
    }
}

//Buscando clientes
const searchClient = async(request, response) =>{
    try{
        const db = mongodb.db(`${process.env.MONGO_DATABASE}`);
        const person = db.collection('client');

        const filter = {cpfClient: request.params.cpfClient}
        const array = []

        await person.find(filter).forEach(p => array.push(p));

        if(array.length > 0){
            response.send(array);
        }
        else{
            response.send('Cliente inexistente')
        }
    }catch{
        response.send(err);
    }
}

//Delete clientes
const deleteClient = async(request, response) => {
    try{
        const db = mongodb.db(`${process.env.MONGO_DATABASE}`).collection('client');

        const filter = {cpfClient: request.params.cpfClient}
        const person = await db.deleteOne(filter);

        if (person.deletedCount > 0 ) {
            response.send('Cliente excluido com sucesso !')
       } else {
            response.send(`Desculpe, o cliente com o CPF "${request.params.cpfClient}" não existe !`)
       }
    }catch(err){
        response.send(err);
    }
}

//Atualizando dados do cliente
const updateClient = async(request, response) => {
    try{
        const db = mongodb.db(`${process.env.MONGO_DATABASE}`).collection('client');
        // const query = {nameClient: request.params.nameClient}
        // const update = {$set: {nameClient: request.params.newName}}
        const result = await db.updateOne({nameClient: request.params.nameClient}, {$set: {nameClient: request.params.newName}})

        if (result.modifiedCount > 0 ) {
            response.send('Cliente atualizado com sucesso !')
        } else {
            response.send('Falha ao atualizar ! ')
        }

    }catch(err){
        response.send(err);
    }
}

//Pedidos
const pedidos = async(request, response) => {
    try{
        const db = mongodb.db(`${process.env.MONGO_DATABASE}`).collection('client');
        var cliente = ''

        await db.find({cpfClient: request.params.cpfClient}).forEach(c => cliente = c)

        if(client != ''){
            const query = 'SELECT * FROM Item WHERE Nome = $1'
            const produto = [request.params.produto]
            
            pool.query(query, produto, async(err, result) => {
                if(err) throw err;
                else if(result.rows.length > 0){
                    const valor = parseInt(request.params.quant) * result.rows[0].valor

                    const pedido = {
                        id: cliente.pedidos.length + 1,
                        produto: result.rows[0].nome,
                        quant: parseInt(request.params.quant),
                        valorFinal: valor
                    }
                    cliente.pedidos.push(pedido)

                    const r = await db.updateOne({cpfClient: cliente.cpfClient}, {$set: {pedidos: cliente.pedidos}})

                    if (r.modifiedCount > 0){
                        response.send("O produto foi adicionado a lista de pedido")
                    }else{
                        response.send("Falha ao adicionar o produto")
                    }
                }else{
                    response.status(400).json({error: "O produto não existe"})
                }
            })
        }else{
            response.status(400).json({error: "Cliente não cadastrado"})
        }
    }catch(err){
        response.send(err);
    }
}


//Exportando tudo
module.exports={add,delet,update,search,addClient,searchClient,deleteClient,updateClient,pedidos}
