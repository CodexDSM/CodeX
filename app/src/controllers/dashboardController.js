const pool = require('../config/database');

class DashboardController {

  // =====================================================================
  // 1. KPIs: total + contagem por status (ordens_servico)
  // =====================================================================
  async summary(req, res, next) {
    const connection = await pool.getConnection();
    try {
      const [[{ total }]] = await connection.execute(
        'SELECT COUNT(*) AS total FROM ordens_servico'
      );

      const [statusRows] = await connection.execute(`
        SELECT status, COUNT(*) AS cnt
        FROM ordens_servico
        GROUP BY status
      `);

      const status_counts = {};
      for (const row of statusRows) {
        status_counts[row.status || 'Indefinido'] = row.cnt;
      }

      res.json({
        success: true,
        data: { 
          total: total || 0, 
          status_counts 
        }
      });

    } catch (error) {
      next(error);
    } finally {
      connection.release();
    }
  }

  // =====================================================================
  // FUNÇÃO AUXILIAR — gera chave AAAA-MM segura
  // =====================================================================
  generateMonthKey(offset) {
    const d = new Date();
    d.setMonth(d.getMonth() - offset);
    return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
  }

  // =====================================================================
  // 2. FRETES POR MÊS
  // =====================================================================
  async monthlyFretes(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE_FORMAT(criado_em, '%Y-%m') AS month,
          COUNT(*) AS total
        FROM ordens_servico
        WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month ASC
      `);

      const months = {};

      // Gera últimos 6 meses com 0
      for (let i = 5; i >= 0; i--) {
        months[this.generateMonthKey(i)] = 0;
      }

      // Insere valores reais
      rows.forEach(r => {
        if (months[r.month] !== undefined) {
          months[r.month] = Number(r.total || 0);
        }
      });

      res.json({
        success: true,
        data: Object.entries(months).map(([month, total]) => ({
          month,
          total
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 3. FATURAMENTO POR MÊS
  // =====================================================================
  async monthlyFaturamento(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE_FORMAT(criado_em, '%Y-%m') AS month,
          COALESCE(SUM(valor),0) AS total
        FROM ordens_servico
        WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 12 MONTH)
        GROUP BY month
        ORDER BY month ASC
      `);

      res.json({
        success: true,
        data: rows.map(r => ({
          month: r.month,
          total: Number(r.total || 0)
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 4. MÉTRICAS DE COTAÇÕES
  // =====================================================================
  async cotacoesMetrics(req, res, next) {
    try {
      const [statusRows] = await pool.query(`
        SELECT 
          status,
          COUNT(*) AS cnt,
          COALESCE(AVG(valor_total), 0) AS avg_valor
        FROM cotacao
        GROUP BY status
      `);

      const [rawMonthly] = await pool.query(`
        SELECT 
          DATE_FORMAT(criado_em, '%Y-%m') AS month,
          COUNT(*) AS total
        FROM cotacao
        WHERE criado_em >= DATE_SUB(CURDATE(), INTERVAL 6 MONTH)
        GROUP BY month
        ORDER BY month ASC
      `);

      const months = {};

      for (let i = 5; i >= 0; i--) {
        months[this.generateMonthKey(i)] = 0;
      }

      rawMonthly.forEach(r => {
        if (months[r.month] !== undefined) {
          months[r.month] = Number(r.total || 0);
        }
      });

      res.json({
        success: true,
        data: {
          status: statusRows.map(r => ({
            status: r.status,
            cnt: r.cnt,
            avg_valor: Number(r.avg_valor || 0)
          })),
          monthly: Object.entries(months).map(([month, total]) => ({
            month,
            total
          }))
        }
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 5. TOP CLIENTES
  // =====================================================================
  async topClientes(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          cl.nome,
          SUM(os.valor) AS total
        FROM ordens_servico os
        LEFT JOIN cliente cl ON os.cliente_id = cl.id
        GROUP BY os.cliente_id
        ORDER BY total DESC
        LIMIT 6
      `);

      res.json({
        success: true,
        data: rows.map(r => ({
          nome: r.nome || 'Sem nome',
          total: Number(r.total || 0)
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 6. USO DE VEÍCULOS
  // =====================================================================
  async veiculosUso(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          v.placa,
          COUNT(*) AS usos
        FROM ordens_servico os
        LEFT JOIN veiculo v ON os.veiculo_id = v.id
        GROUP BY v.id
        ORDER BY usos DESC
        LIMIT 6
      `);

      res.json({
        success: true,
        data: rows.map(r => ({
          placa: r.placa || 'Sem placa',
          usos: Number(r.usos || 0)
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 7. MÉTRICAS DE VENDEDORES
  // =====================================================================
  async vendedoresMetrics(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          c.id AS colaborador_id, 
          c.nome AS colaborador_nome,
          COUNT(*) AS ordens,
          COALESCE(SUM(os.valor),0) AS total,
          COALESCE(AVG(os.valor),0) AS avg_ticket
        FROM ordens_servico os
        LEFT JOIN colaborador c ON os.colaborador_id = c.id
        GROUP BY c.id
        ORDER BY total DESC
        LIMIT 12
      `);

      res.json({
        success: true,
        data: rows.map(r => ({
          id: r.colaborador_id,
          nome: r.colaborador_nome || 'Sem nome',
          ordens: Number(r.ordens || 0),
          total: Number(r.total || 0),
          avg_ticket: Number(r.avg_ticket || 0)
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 8. TIPOS DE SERVIÇO (Pizza Chart)
  // =====================================================================
  async tipoServicos(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          categoria AS tipo,
          COUNT(*) AS total
        FROM ordens_servico
        GROUP BY categoria
      `);

      res.json({
        success: true,
        data: rows.map(r => ({
          tipo: r.tipo || 'Indefinido',
          total: Number(r.total || 0)
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 9. PARTICIPAÇÃO POR CLIENTE
  // =====================================================================
  async clienteShare(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          cl.nome,
          COALESCE(SUM(os.valor), 0) AS total
        FROM ordens_servico os
        LEFT JOIN cliente cl ON os.cliente_id = cl.id
        GROUP BY os.cliente_id
        ORDER BY total DESC
      `);

      res.json({
        success: true,
        data: rows.map(r => ({
          nome: r.nome || 'Sem nome',
          total: Number(r.total || 0)
        }))
      });

    } catch (error) {
      next(error);
    }
  }

  // =====================================================================
  // 10. EVOLUÇÃO DOS VALORES (linha / área)
  // =====================================================================
  async evolucaoValores(req, res, next) {
    try {
      const [rows] = await pool.query(`
        SELECT 
          DATE_FORMAT(criado_em, '%Y-%m') AS month,
          COALESCE(SUM(valor), 0) AS total
        FROM ordens_servico
        GROUP BY month
        ORDER BY month ASC
      `);

      res.json({
        success: true,
        data: rows.map(r => ({
          month: r.month,
          total: Number(r.total || 0)
        }))
      });

    } catch (error) {
      next(error);
    }
  }

}

module.exports = new DashboardController();