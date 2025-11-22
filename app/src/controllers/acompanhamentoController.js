const pool = require('../config/database');

class AcompanhamentoController {

    // Listar acompanhamentos, trazendo nome do cliente por JOIN
    async listarAcompanhamento(req, res) {
        let connection;

        try {
            connection = await pool.getConnection();

            // Buscar etapas
            const [etapas] = await connection.query('SELECT * FROM acompanhamento_etapas ORDER BY ordem');

            // Buscar acompanhamentos (cards) junto com o nome do cliente
            const [cards] = await connection.query(`
        SELECT ac.*, cl.nome AS cliente_nome
        FROM acompanhamentos ac
        LEFT JOIN cliente cl ON cl.id = ac.cliente_id
      `);

            // Monta estrutura esperada no frontend
            const columns = {};
            etapas.forEach(etapa => {
                columns[etapa.id] = {
                    id: etapa.id.toString(),
                    nome: etapa.nome,
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

    // Mover acompanhamento de uma etapa para outra
    async moverAcompanhamento(req, res) {
        let connection;
        try {
            const { cardId, etapaId } = req.body;
            if (!cardId || !etapaId) {
                return res.status(400).json({ message: 'Informações insuficientes para mover acompanhamento.' });
            }

            connection = await pool.getConnection();
            await connection.query('UPDATE acompanhamentos SET etapa_id = ? WHERE id = ?', [etapaId, cardId]);
            res.json({ message: 'Acompanhamento movido com sucesso.' });

        } catch (error) {
            console.error('Erro ao mover acompanhamento', error);
            res.status(500).json({ message: 'Erro interno do servidor ao mover acompanhamento.' });
        } finally {
            if (connection) connection.release();
        }
    }
}

module.exports = new AcompanhamentoController();
