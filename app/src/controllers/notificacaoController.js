const pool = require('../config/database');

class NotificacaoController {
  async create(req, res, next) {
    try {
      const { colaborador_id, tipo, titulo, mensagem, evento_id } = req.body;

      if (!colaborador_id || !tipo || !titulo || !mensagem) {
        return res.status(400).json({ error: 'Campos obrigatórios: colaborador_id, tipo, titulo, mensagem' });
      }

      const [result] = await pool.execute(
        'INSERT INTO notificacao (colaborador_id, tipo, titulo, mensagem, evento_id) VALUES (?, ?, ?, ?, ?)',
        [colaborador_id, tipo, titulo, mensagem, evento_id || null]
      );

      return res.status(201).json({ 
        id: result.insertId, 
        message: 'Notificação criada com sucesso!' 
      });
    } catch (error) {
      return next(error);
    }
  }

  async index(req, res, next) {
    try {
      const colaborador_id = req.user.id;
      const { lida, tipo } = req.query;

      let query = `
        SELECT n.*, e.titulo AS evento_titulo, e.data_inicio AS evento_data_inicio
        FROM notificacao n
        LEFT JOIN evento e ON n.evento_id = e.id
        WHERE n.colaborador_id = ?
      `;
      const params = [colaborador_id];

      if (lida !== undefined) {
        query += ' AND n.lida = ?';
        params.push(lida === 'true');
      }

      if (tipo) {
        query += ' AND n.tipo = ?';
        params.push(tipo);
      }

      query += ' ORDER BY n.criado_em DESC LIMIT 100';

      const [notificacoes] = await pool.execute(query, params);

      return res.json(notificacoes);
    } catch (error) {
      return next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const colaborador_id = req.user.id;

      const [notificacoes] = await pool.execute(
        `SELECT n.*, e.titulo AS evento_titulo, e.data_inicio AS evento_data_inicio
         FROM notificacao n
         LEFT JOIN evento e ON n.evento_id = e.id
         WHERE n.id = ? AND n.colaborador_id = ?`,
        [id, colaborador_id]
      );

      if (notificacoes.length === 0) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      return res.json(notificacoes[0]);
    } catch (error) {
      return next(error);
    }
  }

  async marcarComoLida(req, res, next) {
    try {
      const { id } = req.params;
      const colaborador_id = req.user.id;

      const [result] = await pool.execute(
        'UPDATE notificacao SET lida = TRUE, lida_em = NOW() WHERE id = ? AND colaborador_id = ?',
        [id, colaborador_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      return res.json({ message: 'Notificação marcada como lida' });
    } catch (error) {
      return next(error);
    }
  }

  async marcarTodasComoLidas(req, res, next) {
    try {
      const colaborador_id = req.user.id;

      await pool.execute(
        'UPDATE notificacao SET lida = TRUE, lida_em = NOW() WHERE colaborador_id = ? AND lida = FALSE',
        [colaborador_id]
      );

      return res.json({ message: 'Todas as notificações foram marcadas como lidas' });
    } catch (error) {
      return next(error);
    }
  }

  async delete(req, res, next) {
    try {
      const { id } = req.params;
      const colaborador_id = req.user.id;

      const [result] = await pool.execute(
        'DELETE FROM notificacao WHERE id = ? AND colaborador_id = ?',
        [id, colaborador_id]
      );

      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Notificação não encontrada' });
      }

      return res.json({ message: 'Notificação deletada com sucesso' });
    } catch (error) {
      return next(error);
    }
  }

  async countNaoLidas(req, res, next) {
    try {
      const colaborador_id = req.user.id;

      const [result] = await pool.execute(
        'SELECT COUNT(*) as total FROM notificacao WHERE colaborador_id = ? AND lida = FALSE',
        [colaborador_id]
      );

      return res.json({ total_nao_lidas: result[0].total });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new NotificacaoController();
