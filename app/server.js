// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

// Importa a configuração do Express.
const app = require('./src/app');
const schedulerService = require('./src/services/schedulerService');

// Define a porta do servidor, usando a variável de ambiente ou 3001 como padrão.
const PORT = process.env.PORT || 3001;
// Define o host para ouvir. Em produção/EC2 use 0.0.0.0 para aceitar conexões externas.
const HOST = process.env.HOST || '0.0.0.0';

// Inicia o servidor e exibe uma mensagem no console.
app.listen(PORT, HOST, () => {
  console.log(`Servidor rodando em http://${HOST}:${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

  schedulerService.iniciar();
});