const express = require('express');
const app = express();
const routes = require('./routes');
const PORT = process.env.APP_PORT || 3000;

app.use(express.json());

app.use('/api', routes); 

module.exports = app;