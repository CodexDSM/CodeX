const express = require('express');
const router = express.Router();
const acompanhamentoController = require('../controllers/acompanhamentoController');
const { authenticateToken, authorizeRoles } = require('../middlewares/auth');

// Listar todos os acompanhamentos e etapas
router.get('/', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), acompanhamentoController.listarAcompanhamento.bind(acompanhamentoController));

// Buscar todos os clientes para criar novo acompanhamento
router.get('/clientes/lista', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), acompanhamentoController.buscarClientes.bind(acompanhamentoController));

// Criar novo acompanhamento
router.post('/criar', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), acompanhamentoController.criarAcompanhamento.bind(acompanhamentoController));

// Mover acompanhamento entre etapas
router.post('/mover', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), acompanhamentoController.moverAcompanhamento.bind(acompanhamentoController));

// Remover acompanhamento (soft delete)
router.delete('/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), acompanhamentoController.removerAcompanhamento.bind(acompanhamentoController));

// Listar ordens de serviço
router.get('/ordens-servico/listar', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), acompanhamentoController.listarOrdensServico.bind(acompanhamentoController));

// Atualizar ordem de serviço
router.put('/ordens-servico/:id', authenticateToken, authorizeRoles('Administrador', 'Gerente', 'Comercial', 'Operador'), acompanhamentoController.atualizarOrdemServico.bind(acompanhamentoController));

module.exports = router;
