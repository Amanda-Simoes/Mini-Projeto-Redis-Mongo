//Conexão com o Redis
const redis = require("redis");

const client = redis.createClient({
    //Passando o HOST e a PORTA
    host: process.env.REDIS_HOST,
    port: process.env.REDIS_PORT
});

module.exports = client;