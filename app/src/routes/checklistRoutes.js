const { Router } = require('express');
const multer = require('multer');

const multerConfig = require('../config/multerConfig');
const checklistController = require('../controllers/checklistController');

const router = new Router();
const upload = multer(multerConfig);

// ======================================================================
// ROTA 1: Endpoint para fazer o UPLOAD de um único anexo.
// Ele apenas guarda o ficheiro e retorna o caminho.
// ======================================================================
router.post('/api/files/upload', upload.single('anexo'), checklistController.uploadAnexo);  

// ======================================================================
// ROTA 2: Endpoint para GUARDAR AS RESPOSTAS do checklist.
// Recebe os dados do formulário e os caminhos dos ficheiros já carregados.
// Não usa o Multer, pois os ficheiros já estão no servidor.
// ======================================================================
router.post('/api/checklists/responses', checklistController.salvarRegistro);


module.exports = router;