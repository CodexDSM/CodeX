const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken } = require('../middlewares/auth');

// Todas as rotas com autenticação
router.get('/', authenticateToken, clienteController.index);
router.get('/:id', authenticateToken, clienteController.show);
router.post('/', authenticateToken, clienteController.create);
router.put('/:id', authenticateToken, clienteController.update);
router.delete('/:id', authenticateToken, clienteController.destroy);
router.get('/documento/:documento', authenticateToken, clienteController.findByDocumento);

module.exports = router;
