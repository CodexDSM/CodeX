const db = require('../config/database');
const validator = require('validator');

class AgregadosController {
    async criarAgregado(req, res) {
        try {
            const {
                nome_motorista,
                cnh,
                placa_veiculo,
                modelo_veiculo,
                telefone,
                email
            } = req.body;

            const nome_sanitizado = nome_motorista?.trim();
            const modelo_sanitizado = modelo_veiculo?.trim();

            // Validação campos obrigatórios
            if (!nome_sanitizado || !cnh || !placa_veiculo || !modelo_sanitizado) {
                return res.status(400).json({
                    success: false,
                    message: 'Campos obrigatórios: nome_motorista, cnh, placa_veiculo, modelo_veiculo'
                });
            }

            // Validação CNH - 9 a 11 dígitos
            const cnhLimpo = cnh.toString().replace(/\D/g, '');
            if (cnhLimpo.length < 9 || cnhLimpo.length > 11) {
                return res.status(400).json({
                    success: false,
                    message: 'CNH deve conter entre 9 e 11 dígitos'
                });
            }

            // Validação placa brasileira
            const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
            const placaFormatada = placa_veiculo.replace(/[-\s]/g, '').toUpperCase();
            if (!placaRegex.test(placaFormatada)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de placa inválido'
                });
            }

            // Validação email opcional
            if (email && !validator.isEmail(email)) {
                return res.status(400).json({
                    success: false,
                    message: 'Email inválido'
                });
            }

            // Verificar duplicatas CNH
            const [cnhExistente] = await db.execute(
                'SELECT id FROM agregados WHERE cnh = ?',
                [cnhLimpo]
            );

            if (cnhExistente.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'CNH já cadastrada'
                });
            }

            // Verificar duplicatas placa
            const [placaExistente] = await db.execute(
                'SELECT id FROM agregados WHERE placa_veiculo = ?',
                [placaFormatada]
            );

            if (placaExistente.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Placa já cadastrada'
                });
            }

            // Inserir agregado
            const [resultado] = await db.execute(
                'INSERT INTO agregados (nome_motorista, cnh, placa_veiculo, modelo_veiculo, telefone, email) VALUES (?, ?, ?, ?, ?, ?)',
                [nome_sanitizado, cnhLimpo, placaFormatada, modelo_sanitizado, telefone || null, email || null]
            );

            // Retornar agregado criado
            const [novoAgregado] = await db.execute(
                'SELECT * FROM agregados WHERE id = ?',
                [resultado.insertId]
            );

            res.status(201).json({
                success: true,
                message: 'Agregado cadastrado com sucesso',
                data: novoAgregado[0]
            });

        } catch (error) {
            console.error('Erro ao criar agregado:', error);
            
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({
                    success: false,
                    message: 'Dados já existem no sistema'
                });
            }

            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async listarAgregados(req, res) {
        try {
            // Usar query() em vez de execute() para LIMIT/OFFSET
            let sql, params = [];
            
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search?.trim();
            
            const offset = (page - 1) * limit;

            if (search) {
                sql = 'SELECT * FROM agregados WHERE nome_motorista LIKE ? OR cnh LIKE ? OR placa_veiculo LIKE ? ORDER BY criado_em DESC LIMIT ?, ?';
                params = [`%${search}%`, `%${search}%`, `%${search}%`, offset, limit];
            } else {
                sql = 'SELECT * FROM agregados ORDER BY criado_em DESC LIMIT ?, ?';
                params = [offset, limit];
            }

            // Usar query() para comandos com LIMIT dinâmico
            const [agregados] = await db.query(sql, params);

            // Contar total
            let countSql, countParams = [];
            if (search) {
                countSql = 'SELECT COUNT(*) as total FROM agregados WHERE nome_motorista LIKE ? OR cnh LIKE ? OR placa_veiculo LIKE ?';
                countParams = [`%${search}%`, `%${search}%`, `%${search}%`];
            } else {
                countSql = 'SELECT COUNT(*) as total FROM agregados';
            }

            const [totalResult] = await db.query(countSql, countParams);
            const total = totalResult[0].total;
            const totalPages = Math.ceil(total / limit);

            res.json({
                success: true,
                data: agregados,
                pagination: {
                    pagina_atual: page,
                    por_pagina: limit,
                    total: total,
                    total_paginas: totalPages,
                    tem_proximo: page < totalPages,
                    tem_anterior: page > 1
                }
            });

        } catch (error) {
            console.error('Erro ao listar agregados:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async buscarAgregadoPorId(req, res) {
        try {
            const id = parseInt(req.params.id);
            
            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            const [agregado] = await db.execute(
                'SELECT * FROM agregados WHERE id = ?',
                [id]
            );

            if (agregado.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Agregado não encontrado'
                });
            }

            res.json({
                success: true,
                data: agregado[0]
            });

        } catch (error) {
            console.error('Erro ao buscar agregado:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new AgregadosController();