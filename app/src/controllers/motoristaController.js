// src/controllers/motoristaController.js
const pool = require('../config/database');

class MotoristaController {
  // Listar todos
  async index(req, res, next) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.*, c.nome, c.cpf, c.email, c.telefone, v.placa, v.modelo 
         FROM motorista m 
         JOIN colaborador c ON m.colaborador_id = c.id 
         LEFT JOIN veiculo v ON m.veiculo_id = v.id 
         WHERE c.ativo = true`
      );
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  // Buscar por ID
  async show(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute(
        `SELECT m.*, c.nome, c.cpf, c.email, c.telefone, v.placa, v.modelo 
         FROM motorista m 
         JOIN colaborador c ON m.colaborador_id = c.id 
         LEFT JOIN veiculo v ON m.veiculo_id = v.id 
         WHERE m.colaborador_id = ?`,
        [id]
      );

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }

      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  // Criar
  async create(req, res, next) {
    try {
      const { colaborador_id, cnh, categoria_cnh, validade_cnh, veiculo_id } = req.body;

      // Verificar se o colaborador é motorista
      const [colaborador] = await pool.execute(
        'SELECT perfil FROM colaborador WHERE id = ?',
        [colaborador_id]
      );

      if (colaborador.length === 0 || colaborador[0].perfil !== 'Motorista') {
        return res.status(400).json({ error: 'Colaborador deve ter perfil de Motorista' });
      }

      const [result] = await pool.execute(
        'INSERT INTO motorista (colaborador_id, cnh, categoria_cnh, validade_cnh, veiculo_id) VALUES (?, ?, ?, ?, ?)',
        [colaborador_id, cnh, categoria_cnh, validade_cnh, veiculo_id]
      );

      res.status(201).json({ message: 'Motorista criado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Atualizar
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { cnh, categoria_cnh, validade_cnh, veiculo_id } = req.body;

      const [result] = await pool.execute(
        'UPDATE motorista SET cnh = ?, categoria_cnh = ?, validade_cnh = ?, veiculo_id = ? WHERE colaborador_id = ?',
        [cnh, categoria_cnh, validade_cnh, veiculo_id, id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }

      res.json({ message: 'Motorista atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Deletar
  async destroy(req, res, next) {
    try {
      const { id } = req.params;
      
      const [result] = await pool.execute(
        'DELETE FROM motorista WHERE colaborador_id = ?',
        [id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Motorista não encontrado' });
      }

      res.json({ message: 'Motorista deletado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  // Motoristas disponíveis
  async disponiveis(req, res, next) {
    try {
      const [rows] = await pool.execute(
        `SELECT m.*, c.nome, v.placa 
         FROM motorista m 
         JOIN colaborador c ON m.colaborador_id = c.id 
         LEFT JOIN veiculo v ON m.veiculo_id = v.id 
         WHERE c.ativo = true 
         AND m.colaborador_id NOT IN (
           SELECT DISTINCT motorista_id 
           FROM frete 
           WHERE status IN ('Coletado', 'Transito') 
           AND motorista_id IS NOT NULL
         )`
      );
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new MotoristaController();