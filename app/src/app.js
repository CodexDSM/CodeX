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
const generalidadesRoutes = require('./routes/generalidadesRoutes');
const tabelaPrecoRoutes = require('./routes/tabelaPrecoRoutes');

const acompanhamentoRoutes = require('./routes/acompanhamentoRoutes');

const app = express();

// Configure CORS dinamicamente via variável de ambiente CLIENT_ORIGIN.
// - Sete CLIENT_ORIGIN para algo como 'http://3.18.105.117:3000' para permitir somente esse origin.
// - Sete CLIENT_ORIGIN='*' para permitir todos (note que com credentials=true '*' não é permitido pelo padrão CORS,
//   portanto o middleware aceita '*' como wildcard aqui).
// const CLIENT_ORIGIN = process.env.CLIENT_ORIGIN || 'http://localhost:3000';
const CLIENT_ORIGIN='*'

// Suporta múltiplos origins separados por vírgula na variável CLIENT_ORIGIN,
// aceita também apenas hostname (ex: 3.147.67.126) ou curinga '*'.
app.use(cors({
  origin: function(origin, callback) {
    // Permite requisições sem origin (ex: curl, Postman, server-to-server)
    if (!origin) return callback(null, true);

    const allowed = CLIENT_ORIGIN.split(',').map(s => s.trim()).filter(Boolean);

    // Se tiver curinga em qualquer posição, aceita qualquer origin
    if (allowed.includes('*')) return callback(null, true);

    // Verifica cada allowed origin; aceita se bater exatamente com origin,
    // se tiver scheme (https://...) ou apenas hostname/IP.
    for (const a of allowed) {
      if (!a) continue;
      try {
        // Se 'a' for uma URL completa (com esquema), compare origin
        const parsed = new URL(a);
        if (parsed.origin === origin) return callback(null, true);
      } catch (e) {
        // 'a' não é uma URL completa - pode ser hostname/IP sem esquema
        // Aceita quando origin contém o hostname/IP configurado
        if (origin.includes('://' + a) || origin.includes(a)) return callback(null, true);
      }
      // Também aceita se o valor informado na env for exatamente igual ao origin
      if (a === origin) return callback(null, true);
    }

    // Caso contrário nega
    return callback(new Error('Not allowed by CORS'));
  },
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
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
app.use('/api/cotacoes/generalidades', generalidadesRoutes);
app.use('/api/cotacoes/tabelas-preco', tabelaPrecoRoutes);
app.use('/api/cotacoes', cotacoesRoutes);
app.use('/api/acompanhamento', acompanhamentoRoutes);


// Rota de teste para verificar se a API está online
app.get('/api/health', (req, res) => {
  res.json({ status: 'OK', message: 'API funcionando' });
});

// Middleware centralizado para tratamento de erros
app.use(errorHandler);

module.exports = app;