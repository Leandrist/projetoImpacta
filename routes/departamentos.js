const express = require('express');
const router = express.Router();
const pool = require('../database');
const departamentosController = require('../controllers/departamentosController');

router.post('/', departamentosController.criarDepartamento);
router.get('/', departamentosController.listarDepartamentos);
router.put('/:id', departamentosController.atualizarDepartamento);
router.delete('/:id', departamentosController.removerDepartamento);

module.exports = router;