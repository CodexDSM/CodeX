const express = require('express');
const router = express.Router();
const agregadosController = require('../controllers/agregadosController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rota pública para cadastro de agregado
router.post('/public/agregados', agregadosController.criarAgregado.bind(agregadosController));

// Rotas protegidas que requerem autenticação E perfil de Administrador
router.get('/agregados', authenticateToken, authorizeRoles('Administrador'), agregadosController.listarAgregados.bind(agregadosController));
router.get('/agregados/:id', authenticateToken, authorizeRoles('Administrador'), agregadosController.buscarAgregadoPorId.bind(agregadosController));

module.exports = router;
