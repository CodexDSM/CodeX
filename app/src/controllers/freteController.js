const pool = require('../config/database');

class FreteController {
  // Lista todos os fretes com filtros
  async index(req, res, next) {
    try {
      const { status, cliente_id, motorista_id, data_inicio, data_fim } = req.query;
      let query = 'SELECT * FROM vw_resumo_fretes WHERE 1=1';
      const params = [];

      // Filtra por status do frete
      if (status) {
        query += ' AND status = ?';
        params.push(status);
      }

      // Filtra por ID do cliente
      if (cliente_id) {
        query += ' AND cliente_id = ?';
        params.push(cliente_id);
      }

      // Filtra por ID do motorista
      if (motorista_id) {
        query += ' AND motorista_id = ?';
        params.push(motorista_id);
      }

      // Filtra por período de data de coleta
      if (data_inicio && data_fim) {
        query += ' AND data_coleta BETWEEN ? AND ?';
        params.push(data_inicio, data_fim);
      }

      query += ' ORDER BY criado_em DESC';

      const [rows] = await pool.execute(query, params);
      res.json(rows);
    } catch (error) {
      next(error);
    }
  }

  // Busca um frete pelo ID
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

  // Cria um novo frete com controle de transação
  async create(req, res, next) {
    const connection = await pool.getConnection();
    try {
      // Inicia a transação
      await connection.beginTransaction();

      const {
        cliente_id, motorista_id, veiculo_id,
        origem_cidade, origem_uf, destino_cidade, destino_uf,
        distancia_km, valor, peso_kg, data_coleta, data_entrega_prevista,
        observacoes
      } = req.body;

      // Gera um código único para o frete
      const codigo = `FRT${Date.now()}`;

      const [result] = await connection.execute(
        `INSERT INTO frete (
          codigo, cliente_id, colaborador_id, motorista_id, veiculo_id,
          origem_cidade, origem_uf, destino_cidade, destino_uf,
          distancia_km, valor, peso_kg, data_coleta, data_entrega_prevista,
          observacoes
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`,
        [
          codigo, cliente_id, req.user.id, motorista_id, veiculo_id,
          origem_cidade, origem_uf, destino_cidade, destino_uf,
          distancia_km, valor, peso_kg, data_coleta, data_entrega_prevista,
          observacoes
        ]
      );

      // Se um veículo foi atribuído, muda o status dele para indisponível
      if (veiculo_id) {
        await connection.execute('UPDATE veiculo SET disponivel = false WHERE id = ?', [veiculo_id]);
      }

      // Confirma a transação
      await connection.commit();
      res.status(201).json({ 
        id: result.insertId, 
        codigo,
        message: 'Frete criado com sucesso' 
      });
    } catch (error) {
      // Em caso de erro, desfaz a transação
      await connection.rollback();
      next(error);
    } finally {
      // Libera a conexão
      connection.release();
    }
  }

  // Atualiza dados de um frete
  async update(req, res, next) {
    try {
      const { id } = req.params;
      const {
        motorista_id, veiculo_id, status,
        distancia_km, valor, peso_kg, 
        data_entrega_prevista, data_entrega,
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
          motorista_id, veiculo_id, status,
          distancia_km, valor, peso_kg,
          data_entrega_prevista, data_entrega,
          observacoes, id
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

  // Atualiza apenas o status de um frete
  async updateStatus(req, res, next) {
    const connection = await pool.getConnection();
    try {
      // Inicia a transação
      await connection.beginTransaction();

      const { id } = req.params;
      const { status } = req.body;

      // Busca o frete atual para pegar o ID do veículo
      const [frete] = await connection.execute('SELECT status, veiculo_id FROM frete WHERE id = ?', [id]);

      if (frete.length === 0) {
        await connection.rollback();
        return res.status(404).json({ error: 'Frete não encontrado' });
      }

      // Atualiza o status do frete
      await connection.execute('UPDATE frete SET status = ? WHERE id = ?', [status, id]);

      // Se o frete for entregue ou cancelado, o veículo volta a ficar disponível
      if ((status === 'Entregue' || status === 'Cancelado') && frete[0].veiculo_id) {
        await connection.execute('UPDATE veiculo SET disponivel = true WHERE id = ?', [frete[0].veiculo_id]);
      }

      // Se o frete for entregue, registra a data de entrega
      if (status === 'Entregue') {
        await connection.execute('UPDATE frete SET data_entrega = CURRENT_DATE WHERE id = ?', [id]);
      }

      // Confirma a transação
      await connection.commit();
      res.json({ message: 'Status atualizado com sucesso' });
    } catch (error) {
      // Em caso de erro, desfaz a transação
      await connection.rollback();
      next(error);
    } finally {
      // Libera a conexão
      connection.release();
    }
  }

  // Busca um frete pelo código
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

  // Gera um relatório de fretes com dados agregados
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
}

module.exports = new FreteController();