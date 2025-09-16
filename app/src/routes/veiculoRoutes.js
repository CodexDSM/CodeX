const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Aplica o middleware de autenticação a todas as rotas de veículo.
router.use(authenticateToken);

// Rotas de visualização de veículos.
// Qualquer usuário autenticado pode ver a lista de veículos, buscar por ID ou por placa.
router.get('/', veiculoController.index);
router.get('/:id', veiculoController.show);
router.get('/placa/:placa', veiculoController.findByPlaca);

// Rotas de gerenciamento de veículos.
// Apenas Administradores e Gerentes podem criar ou atualizar veículos.
router.post('/', authorizeRoles('Administrador', 'Gerente'), veiculoController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente'), veiculoController.update);

// Rota de exclusão (delete).
// Restrita a Administradores e Gerentes.
router.delete('/:id', authorizeRoles('Administrador', 'Gerente'), veiculoController.destroy);

module.exports = router;