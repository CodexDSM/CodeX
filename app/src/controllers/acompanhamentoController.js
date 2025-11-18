const pool = require('../config/database');

class AcompanhamentoController {

    // Listar acompanhamentos, trazendo nome do cliente por JOIN
    async listarAcompanhamento(req, res) {
        let connection;

        try {
            connection = await pool.getConnection();

            // Buscar etapas
            const [etapas] = await connection.query('SELECT * FROM acompanhamento_etapas WHERE ativo = TRUE ORDER BY ordem');

            // Buscar acompanhamentos (cards) junto com o nome do cliente
            const [cards] = await connection.query(`
                SELECT ac.*, cl.nome AS cliente_nome
                FROM acompanhamentos ac
                LEFT JOIN cliente cl ON cl.id = ac.cliente_id
                WHERE ac.ativo = TRUE
            `);

            // Monta estrutura esperada no frontend
            const columns = {};
            etapas.forEach(etapa => {
                columns[etapa.id] = {
                    id: etapa.id.toString(),
                    nome: etapa.nome,
                    cor: etapa.cor,
                    itens: cards
                        .filter(card => card.etapa_id === etapa.id)
                        .map(card => ({
                            ...card,
                            cliente_nome: card.cliente_nome
                        }))
                }
            });

            res.json({ columns, ordemColunas: etapas.map(e => e.id.toString()) });

        } catch (error) {
            console.error('Erro ao listar acompanhamento', error);
            res.status(500).json({ message: 'Erro interno do servidor ao listar acompanhamentos.' });
        } finally {
            if (connection) connection.release();
        }
    }

    // Buscar todos os clientes para criar novo acompanhamento
    async buscarClientes(req, res) {
        let connection;

        try {
            connection = await pool.getConnection();
            const [clientes] = await connection.query(
                'SELECT id, nome, email, telefone FROM cliente WHERE ativo = TRUE ORDER BY nome'
            );

            res.json(clientes);

        } catch (error) {
            console.error('Erro ao buscar clientes', error);
            res.status(500).json({ message: 'Erro ao buscar clientes.' });
        } finally {
            if (connection) connection.release();
        }
    }

    // Criar novo acompanhamento
    async criarAcompanhamento(req, res) {
        let connection;

        try {
            const { cliente_id, titulo, descricao, prioridade } = req.body;

            if (!cliente_id || !titulo) {
                return res.status(400).json({ message: 'Cliente e título são obrigatórios.' });
            }

            connection = await pool.getConnection();

            // Insere novo acompanhamento na etapa inicial (Prospecção = id 1)
            const [result] = await connection.query(
                `INSERT INTO acompanhamentos (cliente_id, etapa_id, titulo, descricao, prioridade) 
                VALUES (?, 1, ?, ?, ?)`,
                [cliente_id, titulo, descricao || null, prioridade || 'Normal']
            );

            res.status(201).json({ 
                message: 'Acompanhamento criado com sucesso.',
                id: result.insertId
            });

        } catch (error) {
            console.error('Erro ao criar acompanhamento', error);
            res.status(500).json({ message: 'Erro ao criar acompanhamento.' });
        } finally {
            if (connection) connection.release();
        }
    }

    // Mover acompanhamento de uma etapa para outra e atualizar status
    async moverAcompanhamento(req, res) {
        let connection;
        try {
            const { cardId, etapaId } = req.body;
            if (!cardId || !etapaId) {
                return res.status(400).json({ message: 'Informações insuficientes para mover acompanhamento.' });
            }

            connection = await pool.getConnection();

            // Atualiza a etapa
            await connection.query(
                'UPDATE acompanhamentos SET etapa_id = ?, atualizado_em = NOW() WHERE id = ?',
                [etapaId, cardId]
            );

            // Se moveu para "Finalizado" (etapa 5), cria ordem de serviço
            if (etapaId === 5) {
                await this.criarOrdemServico(connection, cardId);
            }

            res.json({ message: 'Acompanhamento movido com sucesso.' });

        } catch (error) {
            console.error('Erro ao mover acompanhamento', error);
            res.status(500).json({ message: 'Erro ao mover acompanhamento.' });
        } finally {
            if (connection) connection.release();
        }
    }

    // Remover (soft delete) acompanhamento
    async removerAcompanhamento(req, res) {
        let connection;
        try {
            const { id } = req.params;
            if (!id) return res.status(400).json({ message: 'ID do acompanhamento é obrigatório.' });

            connection = await pool.getConnection();
            await connection.query(
                'UPDATE acompanhamentos SET ativo = FALSE, atualizado_em = NOW() WHERE id = ?',
                [id]
            );

            res.json({ message: 'Acompanhamento removido com sucesso.' });
        } catch (error) {
            console.error('Erro ao remover acompanhamento', error);
            res.status(500).json({ message: 'Erro ao remover acompanhamento.' });
        } finally {
            if (connection) connection.release();
        }
    }

    // Criar ordem de serviço quando acompanhamento é finalizado
    async criarOrdemServico(connection, acompanhamentoId) {
        try {
            // Busca dados do acompanhamento
            const [acomp] = await connection.query(
                'SELECT cliente_id, titulo, descricao FROM acompanhamentos WHERE id = ?',
                [acompanhamentoId]
            );

            if (acomp.length === 0) return;

            const { cliente_id, titulo, descricao } = acomp[0];

            // Gera número OS único (OS-YYYYMMDD-HHMMSS)
            const now = new Date();
            const numeroOS = `OS-${now.toISOString().slice(0, 19).replace(/[-:]/g, '')}`;

            // Insere ordem de serviço
            await connection.query(
                `INSERT INTO ordem_servico (numero_os, acompanhamento_id, cliente_id, descricao_servico, status)
                VALUES (?, ?, ?, ?, 'Aberta')`,
                [numeroOS, acompanhamentoId, cliente_id, descricao || titulo]
            );

            console.log(`Ordem de Serviço criada: ${numeroOS}`);

        } catch (error) {
            console.error('Erro ao criar ordem de serviço', error);
            throw error;
        }
    }

    // Buscar ordens de serviço criadas
    async listarOrdensServico(req, res) {
        let connection;

        try {
            connection = await pool.getConnection();
            const [ordens] = await connection.query(`
                SELECT os.*, cl.nome AS cliente_nome, col.nome AS colaborador_nome
                FROM ordem_servico os
                LEFT JOIN cliente cl ON cl.id = os.cliente_id
                LEFT JOIN colaborador col ON col.id = os.colaborador_responsavel_id
                ORDER BY os.data_criacao DESC
            `);

            res.json(ordens);

        } catch (error) {
            console.error('Erro ao listar ordens de serviço', error);
            res.status(500).json({ message: 'Erro ao listar ordens de serviço.' });
        } finally {
            if (connection) connection.release();
        }
    }

    // Atualizar ordem de serviço
    async atualizarOrdemServico(req, res) {
        let connection;

        try {
            const { id } = req.params;
            const { status, valor_final, data_conclusao_real } = req.body;

            connection = await pool.getConnection();
            await connection.query(
                `UPDATE ordem_servico SET status = ?, valor_final = ?, data_conclusao_real = ?, atualizado_em = NOW()
                WHERE id = ?`,
                [status || null, valor_final || null, data_conclusao_real || null, id]
            );

            res.json({ message: 'Ordem de Serviço atualizada com sucesso.' });

        } catch (error) {
            console.error('Erro ao atualizar ordem de serviço', error);
            res.status(500).json({ message: 'Erro ao atualizar ordem de serviço.' });
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = new AcompanhamentoController();
