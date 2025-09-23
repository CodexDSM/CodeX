const pool = require('../config/database');

class LocalizacaoController {
  // Registra uma nova localização para um colaborador
  async create(req, res, next) {
    try {
      const { colaborador_id, tipo_localizacao } = req.body;
      const usuarioLogado = req.user;

      // Apenas admins/gerentes podem registrar para outros, ou o próprio usuário
      if (usuarioLogado.perfil !== 'Administrador' && 
          usuarioLogado.perfil !== 'Gerente' && 
          usuarioLogado.id !== parseInt(colaborador_id)) {
        return res.status(403).json({ 
          error: 'Acesso negado. Você só pode registrar sua própria localização.' 
        });
      }

      // Verifica se o colaborador existe
      const [colaboradorRows] = await pool.execute(
        'SELECT id FROM colaborador WHERE id = ? AND ativo = true',
        [colaborador_id]
      );

      if (colaboradorRows.length === 0) {
        return res.status(404).json({ error: 'Colaborador não encontrado ou inativo' });
      }

      const [result] = await pool.execute(
        'INSERT INTO localizacao_colaborador (colaborador_id, tipo_localizacao) VALUES (?, ?)',
        [colaborador_id, tipo_localizacao]
      );

      res.status(201).json({ 
        id: result.insertId,
        colaborador_id: parseInt(colaborador_id),
        tipo_localizacao,
        message: 'Localização registrada com sucesso' 
      });

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  // Lista as últimas 30 localizações de um colaborador
  async getHistorico(req, res, next) {
    try {
      const { colaborador_id } = req.params;
      const usuarioLogado = req.user;

      // Controle de acesso: apenas admins/gerentes ou o próprio usuário
      if (usuarioLogado.perfil !== 'Administrador' && 
          usuarioLogado.perfil !== 'Gerente' && 
          usuarioLogado.id !== parseInt(colaborador_id)) {
        return res.status(403).json({ 
          error: 'Acesso negado. Você só pode ver seu próprio histórico.' 
        });
      }

      const [rows] = await pool.execute(`
        SELECT 
          l.id, 
          l.tipo_localizacao, 
          l.data_hora,
          c.nome as colaborador_nome
        FROM localizacao_colaborador l
        INNER JOIN colaborador c ON l.colaborador_id = c.id
        WHERE l.colaborador_id = ?
        ORDER BY l.data_hora DESC
        LIMIT 30
      `, [colaborador_id]);

      res.json(rows);

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  // Busca a localização atual (mais recente) de um colaborador
  async getAtual(req, res, next) {
    try {
      const { colaborador_id } = req.params;
      const usuarioLogado = req.user;

      // Controle de acesso
      if (usuarioLogado.perfil !== 'Administrador' && 
          usuarioLogado.perfil !== 'Gerente' && 
          usuarioLogado.id !== parseInt(colaborador_id)) {
        return res.status(403).json({ 
          error: 'Acesso negado.' 
        });
      }

      const [rows] = await pool.execute(`
        SELECT 
          l.id, 
          l.tipo_localizacao, 
          l.data_hora,
          c.nome as colaborador_nome
        FROM localizacao_colaborador l
        INNER JOIN colaborador c ON l.colaborador_id = c.id
        WHERE l.colaborador_id = ?
        ORDER BY l.data_hora DESC
        LIMIT 1
      `, [colaborador_id]);

      if (rows.length === 0) {
        return res.status(404).json({ error: 'Nenhuma localização encontrada para este colaborador' });
      }

      res.json(rows[0]);

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  // Lista todas as localizações com filtros (apenas para admins/gerentes)
  async index(req, res, next) {
    try {
      const { tipo_localizacao, data_inicio, data_fim } = req.query;
      let query = `
        SELECT 
          l.id, 
          l.colaborador_id,
          l.tipo_localizacao, 
          l.data_hora,
          c.nome as colaborador_nome,
          c.cpf as colaborador_cpf
        FROM localizacao_colaborador l
        INNER JOIN colaborador c ON l.colaborador_id = c.id
        WHERE 1=1
      `;
      const params = [];

      // Filtro por tipo de localização
      if (tipo_localizacao) {
        query += ' AND l.tipo_localizacao = ?';
        params.push(tipo_localizacao);
      }

      // Filtro por data de início
      if (data_inicio) {
        query += ' AND DATE(l.data_hora) >= ?';
        params.push(data_inicio);
      }

      // Filtro por data fim
      if (data_fim) {
        query += ' AND DATE(l.data_hora) <= ?';
        params.push(data_fim);
      }

      query += ' ORDER BY l.data_hora DESC LIMIT 100';

      const [rows] = await pool.execute(query, params);
      res.json(rows);

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  // Conta quantos colaboradores estão em cada localização atualmente
  async getEstatisticasAtuais(req, res, next) {
    try {
      const [estatisticas] = await pool.execute(`
        SELECT 
          l1.tipo_localizacao,
          COUNT(*) as total_colaboradores,
          GROUP_CONCAT(c.nome SEPARATOR ', ') as colaboradores
        FROM localizacao_colaborador l1
        INNER JOIN colaborador c ON l1.colaborador_id = c.id
        WHERE l1.data_hora = (
          SELECT MAX(l2.data_hora) 
          FROM localizacao_colaborador l2 
          WHERE l2.colaborador_id = l1.colaborador_id
        )
        AND c.ativo = true
        GROUP BY l1.tipo_localizacao
        ORDER BY total_colaboradores DESC
      `);

      // Formatar resposta com totais zerados para tipos não utilizados
      const tiposLocalizacao = ['Presencial', 'Home_Office', 'Evento', 'Treinamento'];
      const resultado = tiposLocalizacao.map(tipo => {
        const estatistica = estatisticas.find(est => est.tipo_localizacao === tipo);
        return {
          tipo_localizacao: tipo,
          total_colaboradores: estatistica ? estatistica.total_colaboradores : 0,
          colaboradores: estatistica ? estatistica.colaboradores.split(', ') : []
        };
      });

      // Adicionar total geral
      const totalGeral = estatisticas.reduce((total, est) => total + est.total_colaboradores, 0);

      res.json({
        estatisticas: resultado,
        total_geral: totalGeral,
        data_consulta: new Date().toISOString()
      });

    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }
}

module.exports = new LocalizacaoController();
