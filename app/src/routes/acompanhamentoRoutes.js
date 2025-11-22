const express = require('express');
const router = express.Router();
const acompanhamentoController = require('../controllers/acompanhamentoController');

router.get('/', acompanhamentoController.listarAcompanhamento);
router.post('/mover', acompanhamentoController.moverAcompanhamento);

module.exports = router;
