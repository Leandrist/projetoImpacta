const pool = require('../database');

const noticiasController = {
    criarNoticia: async (req, res) => {
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
    },

    
    listarNoticias: async (req, res) => {
        try {
            const { departamento_id, titulo_contem } = req.query;
            const { departamentos, is_admin } = req.user;
            
            let sql = `
                SELECT n.*, d.nome AS departamento_nome 
                FROM Noticias n
                JOIN Departamentos d ON n.departamento_id = d.id
                WHERE 1=1
            `;
            const params = [];
    
            //usuários não admin
            if (!is_admin) {
                sql += ' AND (n.departamento_id IS NULL OR n.departamento_id IN (?)';
                params.push(departamentos.length ? departamentos : [0]);
                
                // se tiver departamento geral id 0 ou NULL
                sql += ' OR n.departamento_id = 0)';
            }
    
            if (departamento_id) {
                sql += ' AND n.departamento_id = ?';
                params.push(departamento_id);
            }
    
            if (titulo_contem) {
                sql += ' AND n.titulo LIKE ?';
                params.push(`%${titulo_contem}%`);
            }
    
            sql += ' ORDER BY n.data_publicacao DESC';
    
            const [result] = await pool.query(sql, params);
            res.json(result);
        } catch (error) {
            console.error("Erro ao listar notícias:", error);
            res.status(500).json({ error: "Erro ao listar notícias." });
        }
    },

    buscarNoticia: async (req, res) => {
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
    },

    atualizarNoticia: async (req, res) => {
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
    },

    removerNoticia: async (req, res) => {
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
    }
};

module.exports = noticiasController;