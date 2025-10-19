const express = require('express');
const router = express.Router();
const cotacoesController = require('../controllers/cotacoesController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Todas as rotas requerem autenticação
// Apenas Comercial, Gerente e Administrador podem gerenciar cotações

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

router.get('/codigo/:codigo', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.findByCodigo
);

router.post('/:id/enviar', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.enviarEmail
);

router.patch('/:id/status', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  cotacoesController.updateStatus
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  cotacoesController.delete
);

module.exports = router;
