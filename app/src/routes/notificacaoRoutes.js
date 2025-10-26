const express = require('express');
const router = express.Router();
const notificacaoController = require('../controllers/notificacaoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.post('/', authenticateToken, authorizeRoles('Administrador', 'Gerente'), notificacaoController.create);

router.get('/', authenticateToken, notificacaoController.index);

router.get('/nao-lidas/count', authenticateToken, notificacaoController.countNaoLidas);

router.get('/:id', authenticateToken, notificacaoController.show);

router.patch('/:id/marcar-lida', authenticateToken, notificacaoController.marcarComoLida);

router.patch('/marcar-todas-lidas', authenticateToken, notificacaoController.marcarTodasComoLidas);

router.delete('/:id', authenticateToken, notificacaoController.delete);

module.exports = router;
