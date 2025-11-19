const pool = require('../config/database');

class DashboardController {
  async summary(req, res, next) {
    const connection = await pool.getConnection();
    try {
      // Total ordens e contagem por status
      const [totalRows] = await connection.execute('SELECT COUNT(*) as total FROM ordens_servico');
      const total = totalRows[0].total || 0;

      const [statusRows] = await connection.execute(`
        SELECT status, COUNT(*) as cnt
        FROM ordens_servico
        GROUP BY status
      `);

      const status_counts = {};
      for (const r of statusRows) {
        status_counts[r.status || 'Indefinido'] = r.cnt;
      }

      res.json({ success: true, data: { total, status_counts } });
    } catch (error) {
      return next(error);
    } finally {
      connection.release();
    }
  }

  async monthlyFretes(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT DATE_FORMAT(criado_em, '%Y-%m') as month, COUNT(*) as total
         FROM ordens_servico
         WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY month
         ORDER BY month`
      );

      res.json({ success: true, data: rows });
    } catch (error) {
      return next(error);
    }
  }

  async monthlyFaturamento(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT DATE_FORMAT(criado_em, '%Y-%m') as month, COALESCE(SUM(valor),0) as total
         FROM ordens_servico
         WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
         GROUP BY month
         ORDER BY month`
      );

      // Ensure numeric values
      const data = rows.map(r => ({ month: r.month, total: Number(r.total || 0) }));

      res.json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async cotacoesMetrics(req, res, next) {
    try {
      // status distribution
      const [statusRows] = await pool.query(
        `SELECT status, COUNT(*) as cnt, COALESCE(AVG(valor_total),0) as avg_valor
         FROM cotacao
         GROUP BY status`
      );

      // monthly counts (last 6 months)
      const [monthlyRows] = await pool.query(
        `SELECT DATE_FORMAT(criado_em, '%Y-%m') as month, COUNT(*) as total
         FROM cotacao
         WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
         GROUP BY month
         ORDER BY month`
      );

      res.json({ success: true, data: { status: statusRows, monthly: monthlyRows } });
    } catch (error) {
      return next(error);
    }
  }

  async topClientes(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT cl.nome, SUM(os.valor) as total
         FROM ordens_servico os
         LEFT JOIN cliente cl ON os.cliente_id = cl.id
         GROUP BY os.cliente_id
         ORDER BY total DESC
         LIMIT 6`
      );

      // Normalize null names
      const data = rows.map(r => ({ nome: r.nome || 'Sem nome', total: Number(r.total || 0) }));

      res.json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }

  async veiculosUso(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT v.placa, COUNT(*) as usos
         FROM ordens_servico os
         LEFT JOIN veiculo v ON os.veiculo_id = v.id
         GROUP BY v.id
         ORDER BY usos DESC
         LIMIT 6`
      );

      res.json({ success: true, data: rows });
    } catch (error) {
      return next(error);
    }
  }

  async vendedoresMetrics(req, res, next) {
    try {
      const [rows] = await pool.query(
        `SELECT c.id as colaborador_id, c.nome as colaborador_nome,
                COUNT(*) as ordens, COALESCE(SUM(os.valor),0) as total, COALESCE(AVG(os.valor),0) as avg_ticket
         FROM ordens_servico os
         LEFT JOIN colaborador c ON os.colaborador_id = c.id
         GROUP BY c.id
         ORDER BY total DESC
         LIMIT 12`
      );

      const data = rows.map(r => ({
        id: r.colaborador_id,
        nome: r.colaborador_nome || 'Sem nome',
        ordens: Number(r.ordens || 0),
        total: Number(r.total || 0),
        avg_ticket: Number(r.avg_ticket || 0)
      }));

      res.json({ success: true, data });
    } catch (error) {
      return next(error);
    }
  }
}

module.exports = new DashboardController();
