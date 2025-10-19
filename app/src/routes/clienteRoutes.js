const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Comercial, Gerente e Administrador podem gerenciar clientes
router.get('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  clienteController.index
);

router.get('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  clienteController.show
);

router.post('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  clienteController.create
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  clienteController.update
);

// Apenas Admin e Gerente podem deletar clientes
router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  clienteController.destroy
);

router.get('/documento/:documento', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  clienteController.findByDocumento
);

module.exports = router;
