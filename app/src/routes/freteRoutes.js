// src/routes/freteRoutes.js
const express = require('express');
const router = express.Router();
const freteController = require('../controllers/freteController');
const { authenticateToken } = require('../middlewares/auth');

router.use(authenticateToken);

router.get('/', freteController.index);
router.get('/relatorio', freteController.relatorio);
router.get('/:id', freteController.show);
router.get('/codigo/:codigo', freteController.findByCodigo);
router.post('/', freteController.create);
router.put('/:id', freteController.update);
router.patch('/:id/status', freteController.updateStatus);

module.exports = router;