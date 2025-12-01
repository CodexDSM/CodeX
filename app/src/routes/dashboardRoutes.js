const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

const allowed = authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador');

router.get('/summary', authenticateToken, allowed, dashboardController.summary);
router.get('/monthly-fretes', authenticateToken, allowed, dashboardController.monthlyFretes);
router.get('/top-clientes', authenticateToken, allowed, dashboardController.topClientes);
router.get('/veiculos-uso', authenticateToken, allowed, dashboardController.veiculosUso);
router.get('/vendedores', authenticateToken, allowed, dashboardController.vendedoresMetrics);
router.get('/monthly-faturamento', authenticateToken, allowed, dashboardController.monthlyFaturamento);
router.get('/cotacoes-metrics', authenticateToken, allowed, dashboardController.cotacoesMetrics);
router.get('/tipo-servico', authenticateToken, allowed, dashboardController.tipoServicos);
router.get('/cliente-share', authenticateToken, allowed, dashboardController.clienteShare);
router.get('/evolucao-valores', authenticateToken, allowed, dashboardController.evolucaoValores);
router.post('/relatorio', authenticateToken, allowed, dashboardController.relatorio);

module.exports = router;