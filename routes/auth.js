const express = require('express');
const router = express.Router();
const pool = require('../database');
const jwt = require('jsonwebtoken');
const { hashPassword, verifyPassword } = require('../utils/passwordUtils');

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
        const isValid = await verifyPassword(senha, user.senha_hash, user.salt);
        
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
});

module.exports = router;