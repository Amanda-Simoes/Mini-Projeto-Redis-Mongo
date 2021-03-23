const client = require("./redis")
const poll = require("./postgres")

const add = (request, response) => {
    const query = 'INSERT INTO Item (nome) VALUES ($1)'
    const item = [request.params.produto]
    poll.query(query, item, (err, res) => {
        if (err) throw err;
        console.log(`${res.command} ${res.rowCount}`)
        response.status(200).json({ query: `${res.command} ${res.rowCount}` })
    })
}

module.exports={add}