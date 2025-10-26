const express = require('express');
const router = express.Router();
const generalidadesController = require('../controllers/generalidadesController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.get('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  generalidadesController.index
);

router.get('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente', 'Comercial'), 
  generalidadesController.show
);

router.post('/', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  generalidadesController.create
);

router.put('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  generalidadesController.update
);

router.delete('/:id', 
  authenticateToken, 
  authorizeRoles('Administrador', 'Gerente'), 
  generalidadesController.delete
);

module.exports = router;
