const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Aplica o middleware de autenticação a todas as rotas de frete.
router.use(authenticateToken);

// Rotas que podem ser acessadas por diferentes perfis (todos logados)
router.get('/', freteController.index);
router.get('/:id', freteController.show);
router.get('/codigo/:codigo', freteController.findByCodigo);

// Rotas exclusivas para criação e atualização de fretes
// Comercial também pode criar/atualizar fretes (vendas)
router.post('/', authorizeRoles('Administrador', 'Gerente', 'Comercial'), freteController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente', 'Comercial'), freteController.update);

// Rotas de gerenciamento de status (usado por Motoristas e Gerentes)
router.patch('/:id/status', authorizeRoles('Administrador', 'Gerente', 'Motorista'), freteController.updateStatus);

// Rota de relatório, restrita a perfis gerenciais + Comercial (para análise de vendas)
router.get('/relatorio', authorizeRoles('Administrador', 'Gerente', 'Comercial'), freteController.relatorio);

module.exports = router;
