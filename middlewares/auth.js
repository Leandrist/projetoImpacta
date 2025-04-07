const jwt = require('jsonwebtoken');
const pool = require('../database');

module.exports = {
    authenticate: async (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: "Acesso negado. Token não fornecido." });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            const [user] = await pool.execute(
                'SELECT u.*, GROUP_CONCAT(ud.departamento_id) AS departamentos ' +
                'FROM usuarios u LEFT JOIN usuarios_departamentos ud ON u.id = ud.usuario_id ' +
                'WHERE u.id = ? GROUP BY u.id', 
                [decoded.userId]
            );
            
            if (!user.length) {
                return res.status(401).json({ error: "Usuário não encontrado." });
            }

            req.user = {
                ...user[0],
                departamentos: user[0].departamentos 
                    ? user[0].departamentos.split(',').map(Number) 
                    : []
            };
            
            next();
        } catch (error) {
            res.status(400).json({ error: "Token inválido." });
        }
    },

    checkPermission: (permission) => async (req, res, next) => {
        try {
            const [permissoes] = await pool.execute(
                'SELECT p.nome FROM permissoes p ' +
                'JOIN usuarios_permissoes up ON p.id = up.permissao_id ' +
                'WHERE up.usuario_id = ?',
                [req.user.id]
            );

            const hasPermission = permissoes.some(p => p.nome === permission) || req.user.is_admin;
            
            if (!hasPermission) {
                return res.status(403).json({ error: "Acesso negado. Permissões insuficientes." });
            }

            next();
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: "Erro ao verificar permissões." });
        }
    }
};