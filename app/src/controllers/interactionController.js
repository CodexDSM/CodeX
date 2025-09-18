const pool = require('../config/database');
const { validationResult } = require('express-validator');

// Lógica para criar uma nova interação
const createInteraction = async (req, res) => {
    // Valida os dados da requisição
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
    }

    // Pega os dados do corpo da requisição e dos parâmetros da URL
    const { tipo_interacao, data_interacao, assunto, detalhes } = req.body;
    const { clientId } = req.params;
    // O ID do colaborador vem do token JWT, que foi decodificado pelo middleware
    const colaboradorId = req.user.id;

    try {
        const sql = `
            INSERT INTO interacao_cliente (colaborador_id, cliente_id, tipo_interacao, data_interacao, assunto, detalhes)
            VALUES (?, ?, ?, ?, ?, ?);
        `;
        const values = [colaboradorId, clientId, tipo_interacao, data_interacao, assunto, detalhes];
        
        await pool.execute(sql, values);
        
        res.status(201).json({ message: 'Interação registrada com sucesso.' });
    } catch (error) {
        console.error('Erro ao criar interação:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

// Lógica para buscar as interações de um cliente
const getClientInteractions = async (req, res) => {
    const { clientId } = req.params;

    try {
        const sql = `
            SELECT 
                ic.id,
                ic.tipo_interacao,
                ic.data_interacao,
                ic.assunto,
                ic.detalhes,
                c.nome AS nome_colaborador
            FROM 
                interacao_cliente ic
            JOIN 
                colaborador c ON ic.colaborador_id = c.id
            WHERE 
                ic.cliente_id = ?
            ORDER BY 
                ic.data_interacao DESC;
        `;

        const [rows] = await pool.execute(sql, [clientId]);
        
        if (rows.length === 0) {
            return res.status(404).json({ message: 'Nenhuma interação encontrada para este cliente.' });
        }
        
        res.status(200).json(rows);
    } catch (error) {
        console.error('Erro ao buscar interações:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
};

module.exports = {
    createInteraction,
    getClientInteractions
};