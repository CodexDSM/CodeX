const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Aplica o middleware de autenticação a todas as rotas de cliente.
router.use(authenticateToken);

// Rotas públicas para qualquer usuário autenticado.
router.get('/', clienteController.index);
router.get('/:id', clienteController.show);
router.get('/documento/:documento', clienteController.findByDocumento);

// Rotas exclusivas para o gerenciamento de clientes.
// Apenas administradores e gerentes podem criar, atualizar ou desativar clientes.
router.post('/', authorizeRoles('Administrador', 'Gerente'), clienteController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente'), clienteController.update);
router.delete('/:id', authorizeRoles('Administrador', 'Gerente'), clienteController.destroy);

module.exports = router;