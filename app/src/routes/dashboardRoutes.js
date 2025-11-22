const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const { authenticateToken } = require('../middlewares/auth');

router.get('/summary', authenticateToken, dashboardController.summary);
router.get('/monthly-fretes', authenticateToken, dashboardController.monthlyFretes);
router.get('/top-clientes', authenticateToken, dashboardController.topClientes);
router.get('/veiculos-uso', authenticateToken, dashboardController.veiculosUso);
router.get('/vendedores', authenticateToken, dashboardController.vendedoresMetrics);
router.get('/monthly-faturamento', authenticateToken, dashboardController.monthlyFaturamento);
router.get('/cotacoes-metrics', authenticateToken, dashboardController.cotacoesMetrics);
router.get('/tipo-servico', authenticateToken, dashboardController.tipoServicos);
router.get('/cliente-share', authenticateToken, dashboardController.clienteShare);
router.get('/evolucao-valores', authenticateToken, dashboardController.evolucaoValores);

module.exports = router;