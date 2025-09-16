const pool = require('../config/database');

class VeiculoController {
  // Lista todos os veículos, com filtros opcionais para status de disponibilidade e tipo.
  async index(req, res, next) {
    try {
      const { disponivel, tipo } = req.query;
      let query = 'SELECT * FROM veiculo WHERE 1=1';
      const params = [];

      // Filtra por status de disponibilidade.
      if (disponivel !== undefined) {
        query += ' AND disponivel = ?';
        params.push(disponivel === 'true');
      }

      // Filtra por tipo de veículo (ex: 'Caminhão', 'Van').
      if (tipo) {
        query += ' AND tipo = ?';
        params.push(tipo);
      }

      query += ' ORDER BY modelo';

      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  // Busca um veículo pelo seu ID.
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT * FROM veiculo WHERE id = ?', [id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // Cria um novo veículo.
  async create(req, res, next) {
    try {
      const { placa, modelo, capacidade_kg, tipo } = req.body;

      const [result] = await pool.execute(
        'INSERT INTO veiculo (placa, modelo, capacidade_kg, tipo) VALUES (?, ?, ?, ?)',
        [placa, modelo, capacidade_kg, tipo]
      );

      res.status(201).json({ 
        id: result.insertId, 
        message: 'Veículo criado com sucesso' 
      });
    } catch (error) {
      next(error);
    }
  }

  // Atualiza os dados de um veículo existente.
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { modelo, capacidade_kg, tipo, disponivel } = req.body;

      const [result] = await pool.execute(
        'UPDATE veiculo SET modelo = ?, capacidade_kg = ?, tipo = ?, disponivel = ? WHERE id = ?',
        [modelo, capacidade_kg, tipo, disponivel, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      res.json({ message: 'Veículo atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Deleta um veículo do banco de dados.
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute('DELETE FROM veiculo WHERE id = ?', [id]);

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      res.json({ message: 'Veículo deletado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Busca um veículo pela placa.
  async findByPlaca(req, res, next) {
    try {
      const { placa } = req.params;
      const [rows] = await pool.execute('SELECT * FROM veiculo WHERE placa = ?', [placa]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Veículo não encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new VeiculoController();