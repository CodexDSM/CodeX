const pool = require('../config/database');
const notificacaoService = require('../services/notificacaoService');

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

  // Atualizar evento
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const { titulo, descricao, data_inicio, data_fim, local, responsavel_id } = req.body;

      // Verifica se o evento existe
      const [eventoExiste] = await pool.execute('SELECT id FROM evento WHERE id = ?', [id]);
      if (eventoExiste.length === 0) {
        return res.status(404).json({ error: 'Evento não encontrado' });
      }

      // Atualiza o evento
      await pool.execute(
        `UPDATE evento 
       SET titulo = ?, descricao = ?, data_inicio = ?, data_fim = ?, local = ?, responsavel_id = ?
       WHERE id = ?`,
        [titulo, descricao, data_inicio, data_fim, local, responsavel_id, id]
      );

      // Busca o evento atualizado com nome do responsável
      const [eventoAtualizado] = await pool.execute(
        `SELECT e.*, c.nome AS responsavel_nome, c.email AS responsavel_email
       FROM evento e
       LEFT JOIN colaborador c ON e.responsavel_id = c.id
       WHERE e.id = ?`,
        [id]
      );

      return res.json({
        message: 'Evento atualizado com sucesso!',
        evento: eventoAtualizado[0]
      });
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

  // No método getEventosByColaborador
  async getEventosByColaborador(req, res, next) {
    try {
      const { colaborador_id } = req.params;

      // Permite se o usuário está vendo seus próprios eventos OU se é admin
      if (req.user.id !== parseInt(colaborador_id) && req.user.tipo !== 'Administrador') {
        return res.status(403).json({ error: 'Acesso negado. Você não tem a permissão necessária.' });
      }

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


  async aceitarEvento(req, res, next) {
    try {
      const { evento_id } = req.params;
      const colaborador_id = req.user.id;

      const [convite] = await pool.execute(
        'SELECT * FROM evento_colaborador WHERE evento_id = ? AND colaborador_id = ?',
        [evento_id, colaborador_id]
      );

      if (convite.length === 0) {
        return res.status(404).json({ error: 'Convite para evento não encontrado' });
      }

      if (convite[0].status !== 'Pendente') {
        return res.status(400).json({ error: 'Este convite já foi respondido anteriormente' });
      }

      const [result] = await pool.execute(
        'UPDATE evento_colaborador SET status = ?, respondido_em = NOW() WHERE evento_id = ? AND colaborador_id = ?',
        ['Aceito', evento_id, colaborador_id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({ error: 'Erro ao aceitar evento' });
      }

      await notificacaoService.notificarConviteEvento(evento_id, colaborador_id);

      return res.json({ message: 'Evento aceito com sucesso!' });
    } catch (error) {
      return next(error);
    }
  }

  async recusarEvento(req, res, next) {
    try {
      const { evento_id } = req.params;
      const colaborador_id = req.user.id;
      const { justificativa_recusa } = req.body;

      const [convite] = await pool.execute(
        'SELECT * FROM evento_colaborador WHERE evento_id = ? AND colaborador_id = ?',
        [evento_id, colaborador_id]
      );

      if (convite.length === 0) {
        return res.status(404).json({ error: 'Convite para evento não encontrado' });
      }

      if (convite[0].status !== 'Pendente') {
        return res.status(400).json({ error: 'Este convite já foi respondido anteriormente' });
      }

      const [result] = await pool.execute(
        'UPDATE evento_colaborador SET status = ?, justificativa_recusa = ?, respondido_em = NOW() WHERE evento_id = ? AND colaborador_id = ?',
        ['Recusado', justificativa_recusa || null, evento_id, colaborador_id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({ error: 'Erro ao recusar evento' });
      }

      return res.json({ message: 'Evento recusado com sucesso!' });
    } catch (error) {
      return next(error);
    }
  }

  async marcarConcluido(req, res, next) {
    try {
      const { evento_id } = req.params;
      const colaborador_id = req.user.id;

      const [convite] = await pool.execute(
        'SELECT * FROM evento_colaborador WHERE evento_id = ? AND colaborador_id = ?',
        [evento_id, colaborador_id]
      );

      if (convite.length === 0) {
        return res.status(404).json({ error: 'Você não está vinculado a este evento' });
      }

      if (convite[0].status !== 'Aceito') {
        return res.status(400).json({ error: 'Apenas eventos aceitos podem ser marcados como concluídos' });
      }

      if (convite[0].concluido) {
        return res.status(400).json({ error: 'Este evento já foi marcado como concluído' });
      }

      const [result] = await pool.execute(
        'UPDATE evento_colaborador SET concluido = TRUE, data_conclusao = NOW() WHERE evento_id = ? AND colaborador_id = ?',
        [evento_id, colaborador_id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({ error: 'Erro ao marcar evento como concluído' });
      }

      return res.json({ message: 'Evento marcado como concluído com sucesso!' });
    } catch (error) {
      return next(error);
    }
  }

  async enviarFeedback(req, res, next) {
    try {
      const { evento_id } = req.params;
      const colaborador_id = req.user.id;
      const { feedback } = req.body;

      if (!feedback || feedback.trim() === '') {
        return res.status(400).json({ error: 'O feedback não pode estar vazio' });
      }

      const [convite] = await pool.execute(
        'SELECT * FROM evento_colaborador WHERE evento_id = ? AND colaborador_id = ?',
        [evento_id, colaborador_id]
      );

      if (convite.length === 0) {
        return res.status(404).json({ error: 'Você não está vinculado a este evento' });
      }

      if (convite[0].status !== 'Aceito') {
        return res.status(400).json({ error: 'Apenas eventos aceitos podem receber feedback' });
      }

      const [result] = await pool.execute(
        'UPDATE evento_colaborador SET feedback = ? WHERE evento_id = ? AND colaborador_id = ?',
        [feedback, evento_id, colaborador_id]
      );

      if (result.affectedRows === 0) {
        return res.status(500).json({ error: 'Erro ao enviar feedback' });
      }

      return res.json({ message: 'Feedback enviado com sucesso!' });
    } catch (error) {
      return next(error);
    }
  }
  // Criar novo evento
  async store(req, res, next) {
    try {
      const { titulo, descricao, data_inicio, data_fim, local, responsavel_id, colaboradores_ids } = req.body;

      // Validação básica
      if (!titulo || !data_inicio) {
        return res.status(400).json({ error: 'Título e data de início são obrigatórios' });
      }

      // Insere o evento
      const [result] = await pool.execute(
        `INSERT INTO evento (titulo, descricao, data_inicio, data_fim, local, responsavel_id, status) 
       VALUES (?, ?, ?, ?, ?, ?, 'Pendente')`,
        [titulo, descricao, data_inicio, data_fim, local, responsavel_id]
      );

      const eventoId = result.insertId;

      // Se houver colaboradores para convidar
      if (colaboradores_ids && Array.isArray(colaboradores_ids) && colaboradores_ids.length > 0) {
        const values = colaboradores_ids.map(colab_id => [eventoId, colab_id, 'Pendente']);
        await pool.query(
          'INSERT INTO evento_colaborador (evento_id, colaborador_id, status) VALUES ?',
          [values]
        );
      }

      return res.status(201).json({
        id: eventoId,
        message: 'Evento criado com sucesso!',
        colaboradores_convidados: colaboradores_ids?.length || 0
      });
    } catch (error) {
      return next(error);
    }
  }
  // Buscar colaboradores convidados para um evento
  async getColaboradoresByEvento(req, res, next) {
    try {
      const { id } = req.params;

      // Busca todos os colaboradores convidados para o evento
      const [colaboradores] = await pool.execute(
        `SELECT 
        c.id AS colaborador_id,
        c.nome,
        c.email,
        ec.status,
        ec.respondido_em,
        ec.justificativa_recusa,
        ec.feedback,
        ec.concluido,
        ec.data_conclusao
       FROM evento_colaborador ec
       INNER JOIN colaborador c ON ec.colaborador_id = c.id
       WHERE ec.evento_id = ?
       ORDER BY 
         CASE ec.status
           WHEN 'Pendente' THEN 1
           WHEN 'Aceito' THEN 2
           WHEN 'Recusado' THEN 3
         END,
         c.nome`,
        [id]
      );

      return res.json(colaboradores);
    } catch (error) {
      console.error('Erro ao buscar colaboradores do evento:', error);
      return next(error);
    }
  }


}

module.exports = new EventosController();
