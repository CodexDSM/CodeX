const pool = require('../config/database');

class AgregadosController {

    // Método para criar um novo agregado (AGORA CORRIGIDO E COMPLETO)
    async criarAgregado(req, res) {
        const { nome_motorista, cnh, placa_veiculo, modelo_veiculo, telefone, email } = req.body;

        if (!nome_motorista || !cnh || !placa_veiculo || !modelo_veiculo) {
            return res.status(400).json({ message: 'Campos obrigatórios (Nome, CNH, Placa, Modelo) estão faltando.' });
        }

        let connection;
        try {
            // Pega uma conexão da pool
            connection = await pool.getConnection();

            const sql = `
                INSERT INTO agregados 
                (nome_motorista, cnh, placa_veiculo, modelo_veiculo, telefone, email) 
                VALUES (?, ?, ?, ?, ?, ?)
            `;
            const values = [nome_motorista, cnh, placa_veiculo, modelo_veiculo, telefone, email];

            // Executa a query para inserir os dados
            await connection.query(sql, values);

            // Envia a resposta de sucesso
            res.status(201).json({
                message: 'Agregado cadastrado com sucesso!',
            });

        } catch (error) {
            if (error.code === 'ER_DUP_ENTRY') {
                return res.status(409).json({ message: 'CNH ou Placa do Veículo já cadastrada.' });
            }

            console.error('Erro ao cadastrar agregado:', error);
            res.status(500).json({ message: 'Ocorreu um erro no servidor ao tentar cadastrar o agregado.' });
        } finally {
            // Garante que a conexão seja sempre liberada de volta para a pool
            if (connection) connection.release();
        }
    }

    async listarAgregados(req, res) {
        let connection;
        try {
            connection = await pool.getConnection();

            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 10;
            const search = req.query.search?.trim();
            const offset = (page - 1) * limit;

            let sql, params = [];

            if (search) {
                sql = 'SELECT * FROM agregados WHERE nome_motorista LIKE ? OR cnh LIKE ? OR placa_veiculo LIKE ? ORDER BY criado_em DESC LIMIT ? OFFSET ?';
                // IMPORTANTE: limit e offset devem ser NÚMEROS, não strings
                params = [`%${search}%`, `%${search}%`, `%${search}%`, limit, offset];
            } else {
                sql = 'SELECT * FROM agregados ORDER BY criado_em DESC LIMIT ? OFFSET ?';
                // IMPORTANTE: limit e offset devem ser NÚMEROS
                params = [limit, offset];
            }

            console.log('SQL:', sql);
            console.log('Params:', params);
            console.log('Tipos:', params.map(p => typeof p));

            const [agregados] = await connection.query(sql, params);

            console.log('Agregados encontrados:', agregados.length);

            // Contar total
            let countSql, countParams = [];
            if (search) {
                countSql = 'SELECT COUNT(*) as total FROM agregados WHERE nome_motorista LIKE ? OR cnh LIKE ? OR placa_veiculo LIKE ?';
                countParams = [`%${search}%`, `%${search}%`, `%${search}%`];
            } else {
                countSql = 'SELECT COUNT(*) as total FROM agregados';
            }

            const [totalResult] = await connection.query(countSql, countParams);
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
            res.status(500).json({ message: "Ocorreu um erro no servidor." });
        } finally {
            if (connection) connection.release();
        }
    }
    async buscarAgregadoPorId(req, res) {
        const { id } = req.params;
        res.json({ message: `Buscando agregado com ID: ${id}` });
    }

    async buscarAgregadoPorCNH(req, res) {
        try {
            const cnh = req.params.cnh;
            const cnhLimpo = cnh.toString().replace(/\D/g, '');

            if (cnhLimpo.length < 9 || cnhLimpo.length > 11) {
                return res.status(400).json({
                    success: false,
                    message: 'CNH inválida'
                });
            }
            connection = await pool.getConnection();
            const [agregado] = await connection.execute(
                'SELECT * FROM agregados WHERE cnh = ?',
                [cnhLimpo]
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
            console.error('Erro ao buscar agregado por CNH:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async buscarAgregadoPorPlaca(req, res) {
        try {
            const placa = req.params.placa;
            const placaFormatada = placa.replace(/[-\s]/g, '').toUpperCase();

            const placaRegex = /^[A-Z]{3}[0-9][A-Z0-9][0-9]{2}$/;
            if (!placaRegex.test(placaFormatada)) {
                return res.status(400).json({
                    success: false,
                    message: 'Formato de placa inválido'
                });
            }

            const [agregado] = await req.execute(
                'SELECT * FROM agregados WHERE placa_veiculo = ?',
                [placaFormatada]
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
            console.error('Erro ao buscar agregado por placa:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }

    async atualizarAgregado(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar se agregado existe
            const [agregadoExiste] = await req.execute(
                'SELECT id FROM agregados WHERE id = ?',
                [id]
            );

            if (agregadoExiste.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Agregado não encontrado'
                });
            }

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

            // Validação CNH
            const cnhLimpo = cnh.toString().replace(/\D/g, '');
            if (cnhLimpo.length < 9 || cnhLimpo.length > 11) {
                return res.status(400).json({
                    success: false,
                    message: 'CNH deve conter entre 9 e 11 dígitos'
                });
            }

            // Validação placa
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

            // Verificar duplicatas CNH em outro registro
            const [cnhExistente] = await req.execute(
                'SELECT id FROM agregados WHERE cnh = ? AND id != ?',
                [cnhLimpo, id]
            );

            if (cnhExistente.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'CNH já cadastrada em outro agregado'
                });
            }

            // Verificar duplicatas placa em outro registro
            const [placaExistente] = await req.execute(
                'SELECT id FROM agregados WHERE placa_veiculo = ? AND id != ?',
                [placaFormatada, id]
            );

            if (placaExistente.length > 0) {
                return res.status(409).json({
                    success: false,
                    message: 'Placa já cadastrada em outro agregado'
                });
            }

            // Atualizar agregado
            await req.execute(
                'UPDATE agregados SET nome_motorista = ?, cnh = ?, placa_veiculo = ?, modelo_veiculo = ?, telefone = ?, email = ? WHERE id = ?',
                [nome_sanitizado, cnhLimpo, placaFormatada, modelo_sanitizado, telefone || null, email || null, id]
            );

            // Retornar agregado atualizado
            const [agregadoAtualizado] = await req.execute(
                'SELECT * FROM agregados WHERE id = ?',
                [id]
            );

            res.json({
                success: true,
                message: 'Agregado atualizado com sucesso',
                data: agregadoAtualizado[0]
            });

        } catch (error) {
            console.error('Erro ao atualizar agregado:', error);

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

    async deletarAgregado(req, res) {
        try {
            const id = parseInt(req.params.id);

            if (isNaN(id) || id <= 0) {
                return res.status(400).json({
                    success: false,
                    message: 'ID inválido'
                });
            }

            // Verificar se agregado existe
            const [agregadoExiste] = await req.execute(
                'SELECT id FROM agregados WHERE id = ?',
                [id]
            );

            if (agregadoExiste.length === 0) {
                return res.status(404).json({
                    success: false,
                    message: 'Agregado não encontrado'
                });
            }

            // Deletar agregado
            await req.execute('DELETE FROM agregados WHERE id = ?', [id]);

            res.json({
                success: true,
                message: 'Agregado removido com sucesso'
            });

        } catch (error) {
            console.error('Erro ao deletar agregado:', error);
            res.status(500).json({
                success: false,
                message: 'Erro interno do servidor'
            });
        }
    }
}

module.exports = new AgregadosController();
