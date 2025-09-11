// src/routes/colaboradorRoutes.js
const express = require('express');
const router = express.Router();
const colaboradorController = require('../controllers/colaboradorController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Rota pública
router.post('/login', colaboradorController.login);

// Rotas protegidas
router.use(authenticateToken);

router.get('/', authorizeRoles('Administrador', 'Gerente'), colaboradorController.index);
router.get('/:id', colaboradorController.show);
router.post('/', authorizeRoles('Administrador'), colaboradorController.create);
router.put('/:id', authorizeRoles('Administrador'), colaboradorController.update);
router.delete('/:id', authorizeRoles('Administrador'), colaboradorController.destroy);
router.patch('/:id/senha', colaboradorController.changePassword);

module.exports = router;