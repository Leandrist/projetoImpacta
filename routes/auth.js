const express = require('express');
const router = express.Router();
const pool = require('../database');
const jwt = require('jsonwebtoken');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');

router.post('/register', async (req, res) => {
    const { nome, email, senha, permissao_id = 2 } = req.body; // padrão: 2 leitor
    
    try {
        const [existing] = await pool.execute(
            'SELECT id FROM usuarios WHERE email = ?', 
            [email]
        );
        
        if (existing.length > 0) {
            return res.status(400).json({ error: "Email já cadastrado" });
        }

        const { hash, salt } = await hashPassword(senha);

        const [result] = await pool.execute(
            'INSERT INTO usuarios (nome, email, senha, salt, permissao_id) VALUES (?, ?, ?, ?, ?)',
            [nome, email, hash, salt, permissao_id]
        );

        res.status(201).json({ 
            id: result.insertId,
            nome,
            email,
            permissao_id
        });
    } catch (error) {
        console.error("Erro no registro:", error);
        res.status(500).json({ error: "Erro ao registrar usuário" });
    }
});

router.post('/login', async (req, res) => {
    const { email, senha } = req.body;
    
    try {
        const [users] = await pool.execute(
            'SELECT u.*, p.nome as permissao FROM usuarios u ' +
            'LEFT JOIN permissoes p ON u.permissao_id = p.id ' +
            'WHERE u.email = ?', 
            [email]
        );
        
        if (!users.length) return res.status(401).json({ error: "Credenciais inválidas" });

        const user = users[0];
        const isValid = await verifyPassword(senha, user.senha, user.salt);
        
        if (!isValid) return res.status(401).json({ error: "Credenciais inválidas" });

        const token = jwt.sign(
            { 
                userId: user.id,
                permissao: user.permissao,
                email: user.email
            },
            process.env.JWT_SECRET,
            { expiresIn: '8h' }
        );

        res.json({ 
            token,
            user: {
                id: user.id,
                nome: user.nome,
                email: user.email,
                permissao: user.permissao
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ error: "Erro ao fazer login" });
    }
})
;

module.exports = router;