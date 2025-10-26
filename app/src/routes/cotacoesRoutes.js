const express = require('express');
const router = express.Router();
const cotacoesController = require('../controllers/cotacoesController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.post('/calcular', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.calcular
);

router.post('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.create
);

router.get('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.index
);

router.get('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.show
);

router.post('/:id/enviar', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.enviarEmail
);

router.patch('/:id/aprovar', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.aprovar
);

router.patch('/:id/rejeitar', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.rejeitar
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  cotacoesController.delete
);

module.exports = router;
