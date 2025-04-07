const pool = require('../database');

const departamentosController = {
    criarDepartamento: async (req, res) => {
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
    },

    listarDepartamentos: async (req, res) => {
        try {
            const sql = 'SELECT * FROM Departamentos';
            const [result] = await pool.execute(sql);
            res.json(result);
        } catch (error) {
            console.error("Erro ao listar departamentos:", error.message);
            res.status(500).json({ error: "Erro ao listar departamentos." });
        }
    },

    atualizarDepartamento: async (req, res) => {
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
    },

    removerDepartamento: async (req, res) => {
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
    }
};

module.exports = departamentosController;