require('dotenv').config();
const express = require('express');
const redis = require('./database/redis');
const crud = require('./databases/CRUD');

const app = express();

// app.get('/', (request, response) => {
//     response.send
// })

app.get('add/:produto', crud.add)
app.get('delete/:produto', crud.delete)
app.get('search/:produto', crud.search)
app.get('update/:produto', crud.update)


app.listen(process.env.PORT, () => { 
    console.log(`Server listening on port ${process.env.PORT}`); 
});