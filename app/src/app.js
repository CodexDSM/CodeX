// src/app.js
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

// Importar rotas
const colaboradorRoutes = require('./routes/colaboradorRoutes');
const clienteRoutes = require('./routes/clienteRoutes');
const veiculoRoutes = require('./routes/veiculoRoutes');
const motoristaRoutes = require('./routes/motoristaRoutes');
const freteRoutes = require('./routes/freteRoutes');
const rastreamentoRoutes = require('./routes/rastreamentoRoutes');

const app = express();

// Middlewares
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Rotas
app.use('/api/colaboradores', colaboradorRoutes);
app.use('/api/clientes', clienteRoutes);
app.use('/api/veiculos', veiculoRoutes);
app.use('/api/motoristas', motoristaRoutes);
app.use('/api/fretes', freteRoutes);
app.use('/api/rastreamento', rastreamentoRoutes);

// Rota de teste
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

// Middleware de erro
app.use(errorHandler);

module.exports = app;