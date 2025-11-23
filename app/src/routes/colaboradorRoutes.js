const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/colaboradorController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rotas públicas (não precisam de token)
router.post('/login', colaboradorController.login);

// Aplica o middleware de autenticação a todas as rotas abaixo
router.use(authenticateToken);

// Rotas para listar, criar, atualizar e desativar colaboradores
// Apenas Administradores e Gerentes podem gerenciar outros colaboradores.
router.get('/', authorizeRoles('Administrador', 'Gerente'), colaboradorController.index);
router.post('/', authorizeRoles('Administrador', 'Gerente'), colaboradorController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente'), colaboradorController.update);
router.delete('/:id', authorizeRoles('Administrador', 'Gerente'), colaboradorController.destroy);

// Rotas que qualquer colaborador pode acessar para ver/editar seus próprios dados
// Rotas para histórico de logins (últimos X dias)
router.get('/:id/logins', colaboradorController.loginsByColaborador);
router.get('/logins', colaboradorController.logins);

// rota para ver colaborador (deve ficar depois das rotas específicas acima)
router.get('/:id', colaboradorController.show);
router.patch('/:id/senha', colaboradorController.changePassword);

module.exports = router;