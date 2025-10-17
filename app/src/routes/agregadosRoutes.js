const express = require('express');
const router = express.Router();
const agregadosController = require('../controllers/agregadosController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rota pública para cadastro de agregado
router.post('/', agregadosController.criarAgregado.bind(agregadosController));

// Rotas protegidas que requerem autenticação E perfil de Administrador
router.get('/agregados', authenticateToken, authorizeRoles('Administrador'), agregadosController.listarAgregados.bind(agregadosController));
router.get('/agregados/:id', authenticateToken, authorizeRoles('Administrador'), agregadosController.buscarAgregadoPorId.bind(agregadosController));

// Rota para LISTAR os agregados - GARANTA QUE ESTA LINHA ESTEJA ASSIM:
// Vamos remover a autorização por enquanto para facilitar o teste
router.get('/', authenticateToken, agregadosController.listarAgregados.bind(agregadosController));

// Rota para BUSCAR um agregado por ID
router.get('/:id', authenticateToken, agregadosController.buscarAgregadoPorId.bind(agregadosController));

module.exports = router;
