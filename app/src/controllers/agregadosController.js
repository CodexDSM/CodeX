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

    // Seu método de listar, que já estava correto
    async listarAgregados(req, res) {
        let connection;
        try {
            connection = await pool.getConnection();
            const sql = "SELECT * FROM agregados ORDER BY nome_motorista ASC";
            const [rows] = await connection.query(sql);
            
            res.status(200).json(rows);

        } catch (error) {
            console.error('Erro ao listar agregados:', error);
            res.status(500).json({ message: "Ocorreu um erro no servidor." });
        } finally {
            if (connection) connection.release();
        }
    }

    // Seus outros métodos...
    async buscarAgregadoPorId(req, res) {
        const { id } = req.params;
        res.json({ message: `Buscando agregado com ID: ${id}` });
    }
}

module.exports = new AgregadosController();