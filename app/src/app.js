require('dotenv').config();
const express = require('express');
const cors = require('cors');
const errorHandler = require('./middlewares/errorHandler');

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
const ordensServicosRoutes = require('./routes/ordensServicosRoutes');
const generalidadesRoutes = require('./routes/generalidadesRoutes');
const tabelaPrecoRoutes = require('./routes/tabelaPrecoRoutes');
const acompanhamentoRoutes = require('./routes/acompanhamentoRoutes');
const faturamentoRoutes = require('./routes/faturamentoRoutes');

const app = express();

const CLIENT_ORIGIN = '*';

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin) return callback(null, true);

      const allowed = CLIENT_ORIGIN.split(',')
        .map(s => s.trim())
        .filter(Boolean);

      if (allowed.includes('*')) return callback(null, true);

      for (const a of allowed) {
        if (!a) continue;
        try {
          const parsed = new URL(a);
          if (parsed.origin === origin) return callback(null, true);
        } catch (e) {
          if (origin.includes('://' + a) || origin.includes(a)) {
            return callback(null, true);
          }
        }
        if (a === origin) return callback(null, true);
      }

      return callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
  })
);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

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
app.use('/api/cotacoes/generalidades', generalidadesRoutes);
app.use('/api/cotacoes/tabelas-preco', tabelaPrecoRoutes);
app.use('/api/cotacoes', cotacoesRoutes);
app.use('/api/acompanhamento', acompanhamentoRoutes);
app.use('/api/ordens-servico', ordensServicosRoutes);
app.use('/api/dashboard', dashboardRoutes);
app.use('/api/faturamentos', faturamentoRoutes);

app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

app.use(errorHandler);

module.exports = app;
