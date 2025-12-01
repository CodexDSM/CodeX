const express = require('express');
const router = express.Router();
const localizacaoController = require('../controllers/localizacaoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Aplica autenticação a todas as rotas
router.use(authenticateToken);

// Rotas para registrar localização
router.post('/', localizacaoController.create);

// Rotas para buscar localizações específicas de um colaborador
router.get('/colaborador/:colaborador_id/atual', localizacaoController.getAtual);
router.get('/colaborador/:colaborador_id/historico', localizacaoController.getHistorico);
// Lista de timestamps (últimos N dias) para um colaborador - útil para export/relatórios
router.get('/colaborador/:colaborador_id/logins', localizacaoController.getLogins30d);

// Rota administrativa para listar todas as localizações (apenas admins/gerentes)
router.get('/', authorizeRoles('Administrador', 'Gerente'), localizacaoController.index);

// Estatísticas de localização atual (apenas admin/gerente)
router.get('/estatisticas', authorizeRoles('Administrador', 'Gerente'), localizacaoController.getEstatisticasAtuais);

// Relatório (CSV / PDF)
router.post('/relatorio', authorizeRoles('Administrador', 'Gerente', 'Comercial'), localizacaoController.relatorio);

module.exports = router;
