const express = require('express');
const router = express.Router();
const rastreamentoController = require('../controllers/rastreamentoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rota pública para rastreamento de frete por código (não requer autenticação).
router.get('/publico/:codigo', rastreamentoController.rastrearPorCodigo);

// Aplica o middleware de autenticação a todas as rotas abaixo.
router.use(authenticateToken);

// Rotas de visualização de rastreamento de frete (qualquer usuário logado).
router.get('/frete/:frete_id', rastreamentoController.index);
router.get('/frete/:frete_id/ultima', rastreamentoController.ultimaPosicao);

// Rota para criação de novo ponto de rastreamento.
// Geralmente restrita a motoristas e administradores que enviam as coordenadas.
router.post('/frete/:frete_id', authorizeRoles('Administrador', 'Motorista'), rastreamentoController.create);

module.exports = router;