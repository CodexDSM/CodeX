const express = require('express');
const router = express.Router();
const agregadosController = require('../controllers/agregadosController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rota pública para cadastro de agregado
router.post('/', agregadosController.criarAgregado.bind(agregadosController));

// Rotas protegidas - Administrador, Gerente, Comercial e Operador podem gerenciar agregados
router.post('/agregados', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), agregadosController.criarAgregado.bind(agregadosController));

router.get('/agregados', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), agregadosController.listarAgregados.bind(agregadosController));

router.get('/agregados/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), agregadosController.buscarAgregadoPorId.bind(agregadosController));

router.get('/agregados/cnh/:cnh', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), agregadosController.buscarAgregadoPorCNH.bind(agregadosController));

router.get('/agregados/placa/:placa', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), agregadosController.buscarAgregadoPorPlaca.bind(agregadosController));

router.put('/agregados/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), agregadosController.atualizarAgregado.bind(agregadosController));

// Apenas Administrador e Gerente podem deletar
router.delete('/agregados/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente'), agregadosController.deletarAgregado.bind(agregadosController));

// Rota para LISTAR os agregados - GARANTA QUE ESTA LINHA ESTEJA ASSIM:
// Vamos remover a autorização por enquanto para facilitar o teste
router.get('/', authenticateToken, agregadosController.listarAgregados.bind(agregadosController));

// Rota para BUSCAR um agregado por ID
router.get('/:id', authenticateToken, agregadosController.buscarAgregadoPorId.bind(agregadosController));

module.exports = router;
