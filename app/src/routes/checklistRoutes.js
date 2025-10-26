const { Router } = require('express');
const multer = require('multer');

const multerConfig = require('../config/multerConfig');
const checklistController = require('../controllers/checklistController');

const router = new Router();
const upload = multer(multerConfig);

// ======================================================================
// ROTA 1: Endpoint para fazer o UPLOAD de um único anexo.
// ======================================================================
router.post('/api/files/upload', upload.single('anexo'), checklistController.uploadAnexo);  

// ======================================================================
// ROTA 2: Endpoint para GUARDAR AS RESPOSTAS do checklist.
// ======================================================================
router.post('/api/checklists/responses', checklistController.salvarRegistro.bind(checklistController));

// ======================================================================
// ROTA 3 (NOVA): Endpoint para BUSCAR AS RESPOSTAS de um checklist específico.
// ======================================================================
router.get('/api/checklists/respostas', checklistController.listarRespostas.bind(checklistController));


module.exports = router;