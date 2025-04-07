const express = require('express');
const router = express.Router();
const { authenticate, checkPermission } = require('../middlewares/auth');
const noticiasController = require('../controllers/noticiasController');

router.get('/', authenticate, noticiasController.listarNoticias);
router.post('/', authenticate, checkPermission('editor'), noticiasController.criarNoticia);
router.get('/:id', authenticate, noticiasController.buscarNoticia);
router.put('/:id', authenticate, checkPermission('editor'), noticiasController.atualizarNoticia);
router.delete('/:id', authenticate, checkPermission('admin'), noticiasController.removerNoticia);

module.exports = router;