module.exports = {
    db: {
        host: process.env.DB_HOST,
        user: process.env.DB_USER,
    },
    app: {
        port: process.env.APP_PORT,
        env: process.env.NODE_ENV
    }
};