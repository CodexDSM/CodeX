const pool = require('../config/database');

class EventosController {
  async create(req, res, next) {
    try {
      const { titulo, descricao, data_inicio, data_fim, local } = req.body;
      const responsavel_id = req.user.id;
      
      const [result] = await pool.execute(
        'INSERT INTO evento (titulo, descricao, data_inicio, data_fim, local, responsavel_id) VALUES (?, ?, ?, ?, ?, ?)',
        [titulo, descricao, data_inicio, data_fim, local, responsavel_id]
      );
      return res.status(201).json({ id: result.insertId, message: 'Evento criado com sucesso!' });
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const [eventos] = await pool.execute(
        `SELECT e.*, c.nome AS responsavel_nome, c.email AS responsavel_email
         FROM evento e
         LEFT JOIN colaborador c ON e.responsavel_id = c.id
         ORDER BY e.data_inicio`
      );
      return res.json(eventos);
    } catch (error) {
      return next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const [eventos] = await pool.execute(
        `SELECT e.*, c.nome AS responsavel_nome, c.email AS responsavel_email
         FROM evento e
         LEFT JOIN colaborador c ON e.responsavel_id = c.id
         WHERE e.id = ?`,
        [id]
      );
      if (eventos.length === 0) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }
      return res.json(eventos[0]);
    } catch (error) {
      return next(error);
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, descricao, data_inicio, data_fim, local } = req.body;
      
      const [result] = await pool.execute(
        'UPDATE evento SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ? WHERE id = ?',
        [titulo, descricao, data_inicio, data_fim, local, id]
      );
      
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Evento não encontrado para atualizar' });
      }
      
      return res.json({ message: 'Evento atualizado com sucesso!' });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const [result] = await pool.execute('DELETE FROM evento WHERE id = ?', [id]);
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Evento não encontrado para deletar' });
      }
      return res.json({ message: 'Evento removido com sucesso!' });
    } catch (error) {
      return next(error);
    }
  }

  async getEventosByColaborador(req, res, next) {
    try {
      const { colaborador_id } = req.params;
      const [eventos] = await pool.execute(
        `SELECT e.*, ec.status, ec.respondido_em
         FROM evento e
         INNER JOIN evento_colaborador ec ON ec.evento_id = e.id
         WHERE ec.colaborador_id = ? AND ec.status IN ('Aceito', 'Pendente')
         ORDER BY e.data_inicio`,
        [colaborador_id]
      );
      return res.json(eventos);
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new EventosController();
