// Usando 'require' para importar os pacotes necessários
const { Router } = require('express');
const multer = require('multer');

// Importa a configuração do Multer e o Controller usando 'require'
// Garanta que os caminhos para esses arquivos estejam corretos.
const multerConfig = require('../config/multerConfig');
const checklistController = require('../controllers/checklistController');

// Cria uma nova instância do roteador do Express
const router = new Router();
// Inicializa o Multer com as configurações que definimos
const upload = multer(multerConfig);

// ======================================================================
// DEFINIÇÃO DA ROTA DE CHECKLIST
// ======================================================================
// - Escuta por requisições do tipo POST no endereço '/checklists'.
// - Usa o middleware 'upload.single()' para processar um único arquivo
//   enviado no campo 'anexo_checklist' do formulário.
// - Direciona a requisição (com os dados do formulário e do arquivo)
//   para o método 'store' do nosso checklistController.
// ======================================================================
router.post('/checklists', upload.single('anexo_checklist'), checklistController.store);

// Exporta o router configurado para ser usado no arquivo principal (app.js)
module.exports = router;