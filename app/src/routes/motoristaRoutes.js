// src/routes/motoristaRoutes.js
const express = require('express');
const router = express.Router();
const motoristaController = require('../controllers/motoristaController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', motoristaController.index);
router.get('/disponiveis', motoristaController.disponiveis);
router.get('/:id', motoristaController.show);
router.post('/', authorizeRoles('Administrador', 'Gerente'), motoristaController.create);
router.put('/:id', authorizeRoles('Administrador', 'Gerente'), motoristaController.update);
router.delete('/:id', authorizeRoles('Administrador'), motoristaController.destroy);

module.exports = router;