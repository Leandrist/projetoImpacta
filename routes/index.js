const express = require('express');
const router = express.Router();

// Importar todas as rotas
const departamentosRouter = require('./departamentos');
const noticiasRouter = require('./noticias');
const authRouter = require('./auth');

// Configurar as rotas
router.use('/departamentos', departamentosRouter);
router.use('/noticias', noticiasRouter);
router.use('/auth', authRouter);

// Rota de teste
router.get('/ping', async (req, res) => {
    try {
        const connection = await pool.getConnection();
        await connection.ping();
        connection.release();
        res.json({ message: "Conexão com o banco de dados está ativa." });
    } catch (error) {
        console.error("Erro ao conectar ao banco de dados:", error.message);
        res.status(500).json({ error: "Erro ao conectar ao banco de dados." });
    }
});

module.exports = router;