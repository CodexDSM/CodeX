// src/routes/veiculoRoutes.js
const express = require('express');
const router = express.Router();
const veiculoController = require('../controllers/veiculoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', veiculoController.index);
router.get('/:id', veiculoController.show);
router.get('/placa/:placa', veiculoController.findByPlaca);
router.post('/', authorizeRoles('Administrador', 'Gerente'), veiculoController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente'), veiculoController.update);
router.delete('/:id', authorizeRoles('Administrador'), veiculoController.destroy);

module.exports = router;