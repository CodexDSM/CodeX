// Carrega as variáveis de ambiente do arquivo .env.
require('dotenv').config();

// Importa a configuração do Express.
const app = require('./src/app');
const schedulerService = require('./src/services/schedulerService');

// Define a porta do servidor, usando a variável de ambiente ou 3001 como padrão.
const PORT = process.env.PORT || 3001;

// Inicia o servidor e exibe uma mensagem no console.
app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Ambiente: ${process.env.NODE_ENV || 'development'}`);

  schedulerService.iniciar();
});