const express = require('express');
const router = express.Router();
const pool = require('../database'); 

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

// CRUD - Departamentos
router.post('/departamentos', async (req, res) => {
    const { nome } = req.body;
    if (!nome) return res.status(400).json({ error: "O nome do departamento é obrigatório." });

    try {
        const sql = 'INSERT INTO Departamentos (nome) VALUES (?)';
        const [result] = await pool.execute(sql, [nome]);
        res.status(201).json({ id: result.insertId, nome });
    } catch (error) {
        console.error("Erro ao criar departamento:", error.message);
        res.status(500).json({ error: "Erro ao criar departamento." });
    }
});

router.get('/departamentos', async (req, res) => {
    try {
        const sql = 'SELECT * FROM Departamentos';
        const [result] = await pool.execute(sql);
        res.json(result);
    } catch (error) {
        console.error("Erro ao listar departamentos:", error.message);
        res.status(500).json({ error: "Erro ao listar departamentos." });
    }
});

router.put('/departamentos/:id', async (req, res) => {
    const { id } = req.params;
    const { nome } = req.body;

    try {
        const [exists] = await pool.execute('SELECT id FROM Departamentos WHERE id = ?', [id]);
        if (exists.length === 0) return res.status(404).json({ error: "Departamento não encontrado." });

        const sql = 'UPDATE Departamentos SET nome = ? WHERE id = ?';
        await pool.execute(sql, [nome, id]);
        res.json({ message: "Departamento atualizado com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar departamento:", error.message);
        res.status(500).json({ error: "Erro ao atualizar departamento." });
    }
});

router.delete('/departamentos/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [exists] = await pool.execute('SELECT id FROM Departamentos WHERE id = ?', [id]);
        if (exists.length === 0) return res.status(404).json({ error: "Departamento não encontrado." });

        const sql = 'DELETE FROM Departamentos WHERE id = ?';
        await pool.execute(sql, [id]);
        res.json({ message: "Departamento removido com sucesso." });
    } catch (error) {
        console.error("Erro ao remover departamento:", error.message);
        res.status(500).json({ error: "Erro ao remover departamento." });
    }
});

// CRUD - Notícias
router.post('/noticias', async (req, res) => {
    const { titulo, conteudo, departamento_id } = req.body;
    if (!titulo || !conteudo || !departamento_id) {
        return res.status(400).json({ error: "Todos os campos são obrigatórios." });
    }

    try {
        const sql = 'INSERT INTO Noticias (titulo, conteudo, departamento_id) VALUES (?, ?, ?)';
        const [result] = await pool.execute(sql, [titulo, conteudo, departamento_id]);
        res.status(201).json({ id: result.insertId, titulo, conteudo, departamento_id });
    } catch (error) {
        console.error("Erro ao criar notícia:", error.message);
        res.status(500).json({ error: "Erro ao criar notícia." });
    }
});

router.get('/noticias', async (req, res) => {
    try {
        const sql = 'SELECT * FROM Noticias';
        const [result] = await pool.execute(sql);
        res.json(result);
    } catch (error) {
        console.error("Erro ao listar notícias:", error.message);
        res.status(500).json({ error: "Erro ao listar notícias." });
    }
});

router.get('/noticias/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const sql = 'SELECT * FROM Noticias WHERE id = ?';
        const [result] = await pool.execute(sql, [id]);

        if (result.length === 0) {
            return res.status(404).json({ error: "Notícia não encontrada." });
        }

        res.json(result[0]);
    } catch (error) {
        console.error("Erro ao buscar notícia:", error.message);
        res.status(500).json({ error: "Erro ao buscar notícia." });
    }
});

router.put('/noticias/:id', async (req, res) => {
    const { id } = req.params;
    const { titulo, conteudo, departamento_id } = req.body;

    try {
        const [exists] = await pool.execute('SELECT id FROM Noticias WHERE id = ?', [id]);
        if (exists.length === 0) return res.status(404).json({ error: "Notícia não encontrada." });

        const sql = 'UPDATE Noticias SET titulo = ?, conteudo = ?, departamento_id = ? WHERE id = ?';
        await pool.execute(sql, [titulo, conteudo, departamento_id, id]);
        res.json({ message: "Notícia atualizada com sucesso." });
    } catch (error) {
        console.error("Erro ao atualizar notícia:", error.message);
        res.status(500).json({ error: "Erro ao atualizar notícia." });
    }
});

router.delete('/noticias/:id', async (req, res) => {
    const { id } = req.params;

    try {
        const [exists] = await pool.execute('SELECT id FROM Noticias WHERE id = ?', [id]);
        if (exists.length === 0) return res.status(404).json({ error: "Notícia não encontrada." });

        const sql = 'DELETE FROM Noticias WHERE id = ?';
        await pool.execute(sql, [id]);
        res.json({ message: "Notícia removida com sucesso." });
    } catch (error) {
        console.error("Erro ao remover notícia:", error.message);
        res.status(500).json({ error: "Erro ao remover notícia." });
    }
});

module.exports = router;