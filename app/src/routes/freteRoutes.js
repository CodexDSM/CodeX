const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Aplica o middleware de autenticação a todas as rotas de frete.
router.use(authenticateToken);

// Rotas que podem ser acessadas por diferentes perfis (geralmente todos os logados).
router.get('/', freteController.index);
router.get('/codigo/:codigo', freteController.findByCodigo);
router.get('/:id', freteController.show);

// Rotas exclusivas para criação e atualização de fretes.
// Apenas Administradores e Gerentes podem criar fretes, por exemplo.
router.post('/', authorizeRoles('Administrador', 'Gerente'), freteController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente'), freteController.update);

// Rotas de gerenciamento de status (pode ser usado por Motoristas e Gerentes).
router.patch('/:id/status', authorizeRoles('Administrador', 'Gerente', 'Motorista'), freteController.updateStatus);

// Rota de relatório, restrita a perfis gerenciais.
router.get('/relatorio', authorizeRoles('Administrador', 'Gerente'), freteController.relatorio);

module.exports = router;