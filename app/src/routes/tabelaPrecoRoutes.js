const express = require('express');
const router = express.Router();
const tabelaPrecoController = require('../controllers/tabelaPrecoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.get('/cliente/:clienteId', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  tabelaPrecoController.getByCliente
);

router.get('/buscar', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  tabelaPrecoController.buscarPreco
);

router.get('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  tabelaPrecoController.show
);

router.post('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  tabelaPrecoController.create
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  tabelaPrecoController.update
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  tabelaPrecoController.delete
);

module.exports = router;
