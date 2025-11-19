const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', freteController.index);
router.get(
  '/relatorio',
  authorizeRoles('Administrador', 'Gerente', 'Comercial'),
  freteController.relatorio
);
router.post(
  '/aprovar',
  authorizeRoles('Administrador', 'Gerente', 'Comercial'),
  freteController.aprovarCotacao
);
router.get('/os/:os', freteController.getFreteByOs);
router.get('/codigo/:codigo', freteController.findByCodigo);
router.post(
  '/:freteId/concluir',
  authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Motorista'),
  freteController.concluirFrete
);
router.post(
  '/',
  authorizeRoles('Administrador', 'Gerente', 'Comercial'),
  freteController.create
);
router.put(
  '/:id',
  authorizeRoles('Administrador', 'Gerente', 'Comercial'),
  freteController.update
);
router.patch(
  '/:id/status',
  authorizeRoles('Administrador', 'Gerente', 'Motorista'),
  freteController.updateStatus
);
router.get('/:id', freteController.show);

module.exports = router;
