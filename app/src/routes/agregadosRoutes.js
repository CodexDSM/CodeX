const express = require('express');
const router = express.Router();
const agregadosController = require('../controllers/agregadosController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rota pública para cadastro de agregado
router.post('/public/agregados', agregadosController.criarAgregado.bind(agregadosController));

// Rotas protegidas - Administrador, Gerente e Operador podem gerenciar agregados
router.post('/agregados', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Operador'), agregadosController.criarAgregado.bind(agregadosController));

router.get('/agregados', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Operador'), agregadosController.listarAgregados.bind(agregadosController));

router.get('/agregados/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Operador'), agregadosController.buscarAgregadoPorId.bind(agregadosController));

router.get('/agregados/cnh/:cnh', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Operador'), agregadosController.buscarAgregadoPorCNH.bind(agregadosController));

router.get('/agregados/placa/:placa', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Operador'), agregadosController.buscarAgregadoPorPlaca.bind(agregadosController));

router.put('/agregados/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Operador'), agregadosController.atualizarAgregado.bind(agregadosController));

// Apenas Administrador e Gerente podem deletar
router.delete('/agregados/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente'), agregadosController.deletarAgregado.bind(agregadosController));

module.exports = router;
