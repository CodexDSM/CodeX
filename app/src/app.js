require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Importa os arquivos de rotas
const agregadosRoutes = require('./routes/agregadosRoutes');
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const motoristaRoutes = require('./routes/motoristaRoutes');
const freteRoutes = require('./routes/freteRoutes');
const rastreamentoRoutes = require('./routes/rastreamentoRoutes');
const interactionRoutes = require('./routes/interactionRoutes');
const checklistRoutes = require('./routes/checklistRoutes');
const localizacaoRoutes = require('./routes/localizacaoRoutes');
const eventosRoutes = require('./routes/eventosRoutes');
const notificacaoRoutes = require('./routes/notificacaoRoutes');
const cotacoesRoutes = require('./routes/cotacoesRoutes');

const app = express();

app.use(cors({
  origin: 'http://localhost:3000',
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));


// Middlewares globais da aplicação
app.use(express.json()); // Habilita o uso de JSON no corpo das requisições
app.use(express.urlencoded({ extended: true })); // Habilita o uso de dados de formulário

// Associa as rotas a seus respectivos endpoints
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/fretes', freteRoutes);
app.use('/api/rastreamento', rastreamentoRoutes);
app.use('/api', interactionRoutes);
app.use(checklistRoutes);
app.use('/api/agregados', agregadosRoutes);
app.use('/api/localizacoes', localizacaoRoutes);
app.use('/api/eventos', eventosRoutes);
app.use('/api/notificacoes', notificacaoRoutes);
app.use('/api/cotacoes', cotacoesRoutes);

// Rota de teste para verificar se a API está online
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

// Middleware centralizado para tratamento de erros
app.use(errorHandler);

module.exports = app;