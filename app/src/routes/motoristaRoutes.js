const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motoristaController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Aplica o middleware de autenticação a todas as rotas de motorista.
router.use(authenticateToken);

// Rotas para visualização de dados.
// Qualquer usuário autenticado pode listar motoristas e ver motoristas disponíveis.
router.get('/', motoristaController.index);
router.get('/disponiveis', motoristaController.disponiveis);
router.get('/:id', motoristaController.show);

// Rotas para o gerenciamento de motoristas.
// Apenas Administradores e Gerentes podem criar ou atualizar motoristas.
router.post('/', authorizeRoles('Administrador', 'Gerente'), motoristaController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente'), motoristaController.update);

// Rota de exclusão (delete).
// Restrita apenas a Administradores. O gerente não tem essa permissão.
router.delete('/:id', authorizeRoles('Administrador'), motoristaController.destroy);

module.exports = router;