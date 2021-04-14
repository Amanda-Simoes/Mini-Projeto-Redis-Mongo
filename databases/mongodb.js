const { MongoClient } = require('mongodb');

const client = new MongoClient(`mongodb://${process.env.MONGO_HOST}:${process.env.MONGO_PORT}`,
    { useUnifiedTopology: true });

client.connect().then(()=> {
    console.log("Conectado com o mongo!")
}).catch((err) => {
    console.log(Err)
})

module.exports = client;