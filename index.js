const express = require('express');
const cors = require('cors');
require('dotenv').config(); 
const pool = require('./database'); 
const rotas = require('./routes/rotas'); 

const app = express();

app.use(cors());
app.use(express.json());

app.use('/', rotas);

pool.getConnection()
    .then(conn => {
        console.log('Conectado ao banco de dados com sucesso!');
        conn.release();
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err.message);
    });

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Servidor rodando na porta ${PORT}`);
});
