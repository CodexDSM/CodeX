const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');

// Criar novo evento
router.post('/', eventosController.create);

// Listar todos os eventos
router.get('/', eventosController.index);

// Consultar evento por id
router.get('/:id', eventosController.show);

// Apaga evento por id
router.delete('/:id', eventosController.delete);

// Listar eventos de um colaborador específico (Aceito ou Pendente)
router.get('/colaborador/:colaborador_id', eventosController.getEventosByColaborador);



module.exports = router;
