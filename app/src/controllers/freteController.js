const pool = require('../config/database');

class FreteController {
  async index(req, res, next) {
    try {
      const { status, cliente_id, motorista_id, data_inicio, data_fim } = req.query;
      let query = 'SELECT * FROM vw_resumo_fretes WHERE 1=1';
      const params = [];
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }
      if (cliente_id) {
        query += ' AND cliente_id = ?';
        params.push(cliente_id);
      }
      if (motorista_id) {
        query += ' AND motorista_id = ?';
        params.push(motorista_id);
      }
      if (data_inicio && data_fim) {
        query += ' AND data_coleta BETWEEN ? AND ?';
        params.push(data_inicio, data_fim);
      }
      query += ' ORDER BY data_coleta DESC';
      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  async show(req, res, next) {
    try {
      const { id } = req.params;
      const [rows] = await pool.execute('SELECT * FROM frete WHERE id = ?', [id]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async create(req, res, next) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const {
        cliente_id,
        motorista_id,
        veiculo_id,
        origem_cidade,
        origem_uf,
        destino_cidade,
        destino_uf,
        distancia_km,
        valor,
        peso_kg,
        data_coleta,
        data_entrega_prevista,
        observacoes
      } = req.body;
      const codigo = `FRT${Date.now()}`;
      const [result] = await connection.execute(
        `INSERT INTO frete (
          codigo, cliente_id, colaborador_id, motorista_id, veiculo_id,
          origem_cidade, origem_uf, destino_cidade, destino_uf,
          distancia_km, valor, peso_kg, data_coleta, data_entrega_prevista,
          observacoes, status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo,
          cliente_id,
          req.user && req.user.id ? req.user.id : null,
          motorista_id,
          veiculo_id,
          origem_cidade,
          origem_uf,
          destino_cidade,
          destino_uf,
          distancia_km,
          valor,
          peso_kg,
          data_coleta,
          data_entrega_prevista,
          observacoes,
          'Pendente'
        ]
      );
      if (veiculo_id) {
        await connection.execute('UPDATE veiculo SET disponivel = false WHERE id = ?', [veiculo_id]);
      }
      await connection.commit();
      res.status(201).json({
        id: result.insertId,
        codigo,
        message: 'Frete criado com sucesso'
      });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        motorista_id,
        veiculo_id,
        status,
        distancia_km,
        valor,
        peso_kg,
        data_entrega_prevista,
        data_entrega,
        observacoes
      } = req.body;
      const [result] = await pool.execute(
        `UPDATE frete SET 
          motorista_id = ?, veiculo_id = ?, status = ?,
          distancia_km = ?, valor = ?, peso_kg = ?,
          data_entrega_prevista = ?, data_entrega = ?,
          observacoes = ?
        WHERE id = ?`,
        [
          motorista_id,
          veiculo_id,
          status,
          distancia_km,
          valor,
          peso_kg,
          data_entrega_prevista,
          data_entrega,
          observacoes,
          id
        ]
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }
      res.json({ message: 'Frete atualizado com sucesso' });
    } catch (error) {
      next(error);
    }
  }

  async updateStatus(req, res, next) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const { id } = req.params;
      const { status } = req.body;
      const [frete] = await connection.execute('SELECT status, veiculo_id FROM frete WHERE id = ?', [id]);
      if (frete.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Frete não encontrado' });
      }
      await connection.execute('UPDATE frete SET status = ? WHERE id = ?', [status, id]);
      if ((status === 'Entregue' || status === 'Cancelado') && frete[0].veiculo_id) {
        await connection.execute('UPDATE veiculo SET disponivel = true WHERE id = ?', [frete[0].veiculo_id]);
      }
      if (status === 'Entregue') {
        await connection.execute('UPDATE frete SET data_entrega = CURRENT_DATE WHERE id = ?', [id]);
      }
      await connection.commit();
      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  async findByCodigo(req, res, next) {
    try {
      const { codigo } = req.params;
      const [rows] = await pool.execute('SELECT * FROM vw_resumo_fretes WHERE codigo = ?', [codigo]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async relatorio(req, res, next) {
    try {
      const { data_inicio, data_fim } = req.query;
      const [rows] = await pool.execute(
        `SELECT 
          COUNT(*) as total_fretes,
          SUM(valor) as valor_total,
          SUM(CASE WHEN status = 'Entregue' THEN 1 ELSE 0 END) as entregues,
          SUM(CASE WHEN status = 'Cancelado' THEN 1 ELSE 0 END) as cancelados,
          SUM(CASE WHEN status IN ('Aguardando', 'Coletado', 'Transito') THEN 1 ELSE 0 END) as em_andamento,
          AVG(distancia_km) as distancia_media,
          AVG(valor) as valor_medio
        FROM frete
        WHERE data_coleta BETWEEN ? AND ?`,
        [data_inicio, data_fim]
      );
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async aprovarCotacao(req, res, next) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();

      const { cotacao_id } = req.body || {};
      if (!cotacao_id) {
        await connection.rollback();
        return res.status(400).json({ error: 'cotacao_id é obrigatório' });
      }

      const [cotacoes] = await connection.execute(
        'SELECT * FROM cotacao WHERE id = ? FOR UPDATE',
        [cotacao_id]
      );
      if (cotacoes.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Cotação não encontrada' });
      }

      const cotacao = cotacoes[0];

      const [clientes] = await connection.execute(
        'SELECT id FROM cliente WHERE id = ?',
        [cotacao.cliente_id]
      );
      if (clientes.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Cliente da cotação não encontrado' });
      }

      const year = new Date().getFullYear();
      const [rows] = await connection.execute(
        'SELECT last_seq FROM frete_sequences WHERE year = ? FOR UPDATE',
        [year]
      );
      let seq;
      if (rows.length === 0) {
        await connection.execute(
          'INSERT INTO frete_sequences (year, last_seq) VALUES (?, ?)',
          [year, 1]
        );
        seq = 1;
      } else {
        seq = rows[0].last_seq + 1;
        await connection.execute(
          'UPDATE frete_sequences SET last_seq = ? WHERE year = ?',
          [seq, year]
        );
      }

      const os_number = `OS${year}${String(seq).padStart(6, '0')}`;

      const origemParts = (cotacao.origem || '').split('-').map(p => p.trim());
      const destinoParts = (cotacao.destino || '').split('-').map(p => p.trim());

      const origem_cidade = origemParts[0] || cotacao.origem || '';
      const origem_uf = origemParts[1] || 'SP';
      const destino_cidade = destinoParts[0] || cotacao.destino || '';
      const destino_uf = destinoParts[1] || 'SP';

      const distancia_km = cotacao.km_percorrido || 0;
      const valor = cotacao.valor_cliente || 0;
      const peso_kg = cotacao.peso_kg || 0;

      const [insert] = await connection.execute(
        `INSERT INTO frete (
          codigo,
          cliente_id,
          colaborador_id,
          cotacao_id,
          origem_cidade,
          origem_uf,
          destino_cidade,
          destino_uf,
          distancia_km,
          valor,
          peso_kg,
          data_coleta,
          data_entrega_prevista,
          observacoes,
          status
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          os_number,
          cotacao.cliente_id,
          cotacao.colaborador_id || null,
          cotacao.id,
          origem_cidade,
          origem_uf,
          destino_cidade,
          destino_uf,
          distancia_km,
          valor,
          peso_kg,
          new Date(),
          cotacao.validade_ate || null,
          cotacao.observacoes || null,
          'Pendente'
        ]
      );

      await connection.execute(
        'UPDATE cotacao SET status_aprovacao = ?, status = ? WHERE id = ?',
        ['Aprovada', 'Aceita', cotacao_id]
      );

      await connection.commit();

      res.json({
        success: true,
        frete: { id: insert.insertId, codigo: os_number, status: 'Pendente' }
      });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }

  async getFreteByOs(req, res, next) {
    try {
      const { os } = req.params;
      const [rows] = await pool.execute('SELECT * FROM frete WHERE codigo = ?', [os]);
      if (rows.length === 0) {
        return res.status(404).json({ error: 'Frete não encontrado' });
      }
      res.json(rows[0]);
    } catch (error) {
      next(error);
    }
  }

  async concluirFrete(req, res, next) {
    const connection = await pool.getConnection();
    try {
      await connection.beginTransaction();
      const freteId = req.params.freteId || req.params.id;

      const [fretes] = await connection.execute(
        'SELECT * FROM frete WHERE id = ? FOR UPDATE',
        [freteId]
      );
      if (fretes.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      const frete = fretes[0];

      const [fats] = await connection.execute(
        'SELECT id FROM faturamentos WHERE frete_id = ? LIMIT 1',
        [freteId]
      );
      if (fats.length > 0) {
        await connection.commit();
        return res.json({
          success: true,
          faturamento_id: fats[0].id,
          ja_existia: true
        });
      }

      if (frete.status !== 'Entregue') {
        await connection.execute(
          'UPDATE frete SET status = ?, data_entrega = CURRENT_DATE WHERE id = ?',
          ['Entregue', freteId]
        );
      }

      const valor = frete.valor || req.body.valor || 0;
      const clienteId = frete.cliente_id || req.body.cliente_id || null;
      const vendedorId = frete.colaborador_id || req.body.vendedor_id || null;

      const [insert] = await connection.execute(
        'INSERT INTO faturamentos (frete_id, cliente_id, vendedor_id, valor, tipo, referencia, observacoes) VALUES (?, ?, ?, ?, ?, ?, ?)',
        [
          freteId,
          clienteId,
          vendedorId,
          valor,
          req.body.tipo || null,
          req.body.referencia || null,
          req.body.observacoes || null
        ]
      );

      await connection.commit();
      res.json({ success: true, faturamento_id: insert.insertId, ja_existia: false });
    } catch (error) {
      await connection.rollback();
      next(error);
    } finally {
      connection.release();
    }
  }
}

module.exports = new FreteController();
