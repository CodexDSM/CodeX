// src/routes/clienteRoutes.js
const express = require('express');
const router = express.Router();
const clienteController = require('../controllers/clienteController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', clienteController.index);
router.get('/:id', clienteController.show);
router.get('/documento/:documento', clienteController.findByDocumento);
router.post('/', clienteController.create);
router.put('/:id', clienteController.update);
router.delete('/:id', clienteController.destroy);

module.exports = router;