const pool = require('../config/database');

// Código da OS será preenchido após inserção usando o id autoincrement: OS-<id>

class OrdensServicoController {
  async createFromCotacao(req, res, next) {
    const connection = await pool.getConnection();
    try {
      const { cotacao_id } = req.params;

      // Busca cotação básica
      const [cotacoes] = await connection.execute(
        'SELECT * FROM cotacao WHERE id = ?',
        [cotacao_id]
      );

      if (cotacoes.length === 0) {
        return res.status(404).json({ success: false, message: 'Cotação não encontrada' });
      }

      const cotacao = cotacoes[0];

      // Monta dados da OS a partir da cotação
      const tempCodigo = `OS-TMP-${Date.now()}-${Math.floor(Math.random() * 10000)}`;

      const [result] = await connection.execute(
        `INSERT INTO ordens_servico (
          codigo, cotacao_id, cliente_id, colaborador_id, origem, destino,
          distancia_km, peso_kg, valor, status, data_entrega_prevista, observacoes, dados
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          tempCodigo, // código temporário único para satisfazer NOT NULL/UNIQUE
          cotacao.id,
          cotacao.cliente_id,
          cotacao.colaborador_id,
          cotacao.origem,
          cotacao.destino,
          cotacao.km_percorrido || null,
          cotacao.peso_kg || null,
          cotacao.valor_cliente || null,
          'Pendente',
          cotacao.validade_ate || null,
          cotacao.observacoes || null,
          JSON.stringify({ criado_por_cotacao: cotacao.id })
        ]
      );

      const insertId = result.insertId;

      // Preencher o campo `codigo` no formato simples OS-<id>
      const codigoGerado = `OS-${insertId}`;
      await connection.execute('UPDATE ordens_servico SET codigo = ? WHERE id = ?', [codigoGerado, insertId]);

      const [rows] = await connection.execute('SELECT * FROM ordens_servico WHERE id = ?', [insertId]);

      res.status(201).json({ success: true, data: rows[0], message: 'Ordem de serviço criada a partir da cotação' });

    } catch (error) {
      return next(error);
    } finally {
      connection.release();
    }
  }

  async index(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT os.*, c.codigo as cotacao_codigo, cl.nome as cliente_nome
         FROM ordens_servico os
         LEFT JOIN cotacao c ON os.cotacao_id = c.id
         LEFT JOIN cliente cl ON os.cliente_id = cl.id
         ORDER BY os.criado_em DESC`
      );

      res.json({ success: true, data: rows });
    } catch (error) {
      return next(error);
    }
  }

  // Atualiza status de uma OS
  async updateStatus(req, res, next) {
    const connection = await pool.getConnection();
    try {
      const { id } = req.params;
      const { status } = req.body;

      if (!id || typeof status === 'undefined') {
        return res.status(400).json({ success: false, message: 'ID e status são obrigatórios' });
      }

      await connection.beginTransaction();

      // Atualiza status e timestamp
      const [result] = await connection.execute(
        'UPDATE ordens_servico SET status = ?, atualizado_em = NOW() WHERE id = ?',
        [status, id]
      );

      if (result.affectedRows === 0) {
        await connection.rollback();
        return res.status(404).json({ success: false, message: 'Ordem de serviço não encontrada' });
      }

      // Busca registro atualizado
      const [rows] = await connection.execute('SELECT * FROM ordens_servico WHERE id = ?', [id]);

      await connection.commit();

      res.json({ success: true, data: rows[0], message: 'Status atualizado com sucesso' });
    } catch (error) {
      await connection.rollback();
      return next(error);
    } finally {
      connection.release();
    }
  }
}

module.exports = new OrdensServicoController();
