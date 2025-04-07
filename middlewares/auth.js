const jwt = require('jsonwebtoken');
const pool = require('../database');

module.exports = {
    authenticate: async (req, res, next) => {
        const token = req.header('Authorization')?.replace('Bearer ', '');
        
        if (!token) {
            return res.status(401).json({ error: "Token de acesso não fornecido" });
        }

        try {
            const decoded = jwt.verify(token, process.env.JWT_SECRET);
            
            // Consulta otimizada que traz usuário + permissões + departamentos
            const [users] = await pool.execute(
                `SELECT 
                    u.*, 
                    p.nome as permissao,
                    GROUP_CONCAT(ud.departamento_id) AS departamentos 
                FROM usuarios u
                LEFT JOIN permissoes p ON u.permissao_id = p.id
                LEFT JOIN usuario_departamento ud ON u.id = ud.usuario_id
                WHERE u.id = ? 
                GROUP BY u.id`, 
                [decoded.userId]
            );
            
            if (!users.length) {
                return res.status(401).json({ error: "Usuário não encontrado" });
            }

            const user = users[0];
            
            // Estrutura do usuário que será acessível nas rotas
            req.user = {
                id: user.id,
                nome: user.nome,
                email: user.email,
                permissao: user.permissao,
                is_admin: user.permissao === 'admin', // Conveniência para checks
                departamentos: user.departamentos 
                    ? user.departamentos.split(',').map(Number) 
                    : []
            };
            
            next();
        } catch (error) {
            console.error("Erro na autenticação:", error.message);
            
            if (error.name === 'TokenExpiredError') {
                return res.status(401).json({ error: "Token expirado" });
            }
            
            res.status(401).json({ error: "Token inválido" });
        }
    },

    checkPermission: (requiredPermission) => async (req, res, next) => {
        try {
            // Admins têm acesso total
            if (req.user.is_admin) return next();
            
            // Verifica permissões específicas
            const [permissoes] = await pool.execute(
                'SELECT p.nome FROM permissoes p ' +
                'JOIN usuarios u ON u.permissao_id = p.id ' +
                'WHERE u.id = ?',
                [req.user.id]
            );

            const hasPermission = permissoes.some(
                p => p.nome === requiredPermission
            );
            
            if (!hasPermission) {
                return res.status(403).json({ 
                    error: `Acesso negado. Requer permissão: ${requiredPermission}` 
                });
            }

            next();
        } catch (error) {
            console.error("Erro na verificação de permissão:", error);
            res.status(500).json({ error: "Erro interno ao verificar permissões" });
        }
    }
};