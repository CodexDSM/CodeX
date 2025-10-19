const express = require('express');
const router = express.Router();
const eventosController = require('../controllers/eventosController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.post('/', authenticateToken, authorizeRoles('Administrador', 'Gerente'), eventosController.create);

router.get('/', authenticateToken, eventosController.index);

router.get('/:id', authenticateToken, eventosController.show);

router.put('/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente'), eventosController.update);

router.delete('/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente'), eventosController.delete);

router.get('/colaborador/:colaborador_id', authenticateToken, eventosController.getEventosByColaborador);

router.post('/:evento_id/aceitar', authenticateToken, eventosController.aceitarEvento);

router.post('/:evento_id/recusar', authenticateToken, eventosController.recusarEvento);

router.post('/:evento_id/concluir', authenticateToken, eventosController.marcarConcluido);

router.post('/:evento_id/feedback', authenticateToken, eventosController.enviarFeedback);

module.exports = router;
