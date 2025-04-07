const mysql = require('mysql2/promise');
require('dotenv').config();

const requiredEnvVars = ['DB_HOST', 'DB_USER', 'DB_PASSWORD', 'DB_NAME'];
for (const envVar of requiredEnvVars) {
    if (!process.env[envVar]) {
        throw new Error(`Variável de ambiente ${envVar} não está definida`);
    }
}

const pool = mysql.createPool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    waitForConnections: true,
    connectionLimit: 10,
    queueLimit: 0,
    connectTimeout: 10000, 
    timezone: 'local', 
    charset: 'utf8mb4', 
    multipleStatements: false 
});

pool.getConnection()
    .then(connection => {
        console.log('Conexão com o banco de dados estabelecida com sucesso');
        connection.release();
    })
    .catch(err => {
        console.error('Erro ao conectar ao banco de dados:', err.message);
        process.exit(1); 
    });

module.exports = pool;