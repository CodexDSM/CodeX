const express = require('express');
const router = express.Router();
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');
const faturamentoController = require('../controllers/faturamentoController');

router.use(authenticateToken);

router.post(
  '/relatorio',
  authorizeRoles('Administrador', 'Gerente', 'Comercial'),
  faturamentoController.relatorioFaturamentos
);

module.exports = router;
