const express = require('express');
const router = express.Router();
const ordensServicoController = require('../controllers/ordensServicoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.get('/',
  authenticateToken,
  authorizeRoles('Administrador', 'Gerente', 'Operacional'),
  ordensServicoController.index
);

router.post('/:cotacao_id/from-cotacao',
  authenticateToken,
  authorizeRoles('Administrador', 'Gerente', 'Comercial'),
  ordensServicoController.createFromCotacao
);

router.patch('/:id/status',
  authenticateToken,
  authorizeRoles('Administrador', 'Gerente', 'Operacional', 'Comercial'),
  ordensServicoController.updateStatus
);

module.exports = router;
