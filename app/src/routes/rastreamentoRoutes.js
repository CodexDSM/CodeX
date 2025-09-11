// src/routes/rastreamentoRoutes.js
const express = require('express');
const router = express.Router();
const rastreamentoController = require('../controllers/rastreamentoController');
const { authenticateToken } = require('../middlewares/auth');

// Rota pública para rastreamento
router.get('/publico/:codigo', rastreamentoController.rastrearPorCodigo);

// Rotas protegidas
router.use(authenticateToken);

router.get('/frete/:frete_id', rastreamentoController.index);
router.get('/frete/:frete_id/ultima', rastreamentoController.ultimaPosicao);
router.post('/frete/:frete_id', rastreamentoController.create);

module.exports = router;