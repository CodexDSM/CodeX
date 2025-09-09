require('dotenv').config();
const express = require('express');
const connectDB = require('./config/database');
const errorHandler = require('./src/middlewares/errorHandler');
const customerRoutes = require('./src/api/customer.routes');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

connectDB();

const app = express();

const PORT = process.env.PORT || 5000;

app.use(express.json());

const swaggerOptions = {
  swaggerDefinition: {
    openapi: '3.0.0',
    info: {
      title: 'Customer API',
      version: '1.0.0',
      description: 'API para gerenciamento de clientes',
    },
    servers: [
      {
        url: `http://localhost:${PORT}`,
        description: 'Servidor de Desenvolvimento',
      },
    ],
  },
  apis: ['./src/api/*.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

app.get('/', (req, res) => {
  res.send('API está funcionando...');
});

app.use('/api/v1/customers', customerRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
  console.log(`Documentação da API disponível em http://localhost:${PORT}/api-docs`);
});

