const pool = require('../config/database');

// Helper: gera chave AAAA-MM segura (exportada para uso interno)
function generateMonthKey(offset) {
  const d = new Date();
  d.setMonth(d.getMonth() - offset);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
}

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
        months[generateMonthKey(i)] = 0;
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
        months[generateMonthKey(i)] = 0;
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
  // =====================================================================
  // 11. RELATÓRIO (PDF/CSV) gerado a partir do payload enviado pelo frontend
  // Recebe o payload (summary, monthly, monthlyFaturamento, topClientes, tipoServicos, clienteShare, evolucaoValores)
  // e retorna um PDF (ou CSV) como anexo.
  // Nota: para simplicidade o frontend envia os dados já agregados.
  // =====================================================================
  async relatorio(req, res, next) {
    try {
      const payload = req.body || {};
      const format = (payload.format || 'pdf').toLowerCase();

      if (format === 'csv') {
        const sep = ';';
        const lines = [];
        const writeRows = (title, headers, rows) => {
          lines.push([`Seção: ${title}`]);
          if (headers && headers.length) lines.push(headers);
          (rows || []).forEach(r => {
            const row = headers.map(h => {
              const v = r[h] == null ? '' : r[h];
              const s = String(v).replace(/"/g, '""');
              return `"${s}"`;
            });
            lines.push(row);
          });
          lines.push([]);
        };

        // Summary
        if (payload.summary) {
          const s = payload.summary;
          Object.keys(s).forEach(k => lines.push([`${k}${sep}${String(s[k])}`]));
          lines.push([]);
        }

        writeRows('Top Clientes', ['nome', 'total'], payload.topClientes || []);
        writeRows('Tipo de Serviços', ['tipo', 'total'], payload.tipoServicos || []);

        const csv = lines.map(r => (Array.isArray(r) ? r.join(sep) : String(r))).join('\r\n');
        res.set('Content-Type', 'text/csv');
        return res.send(csv);
      }

      if (format === 'pdf') {
        const PDFDocument = require('pdfkit');
        const doc = new PDFDocument({ size: 'A4', margin: 0, lineGap: 2 });
        const chunks = [];

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="dashboard-relatorio.pdf"');

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.end(pdfBuffer);
        });

        // Simple styled header similar to faturamentos
        const BLUE_PRIMARY = '#2563eb';
        const BLUE_DARK = '#1d4ed8';
        const GRAY_50 = '#f9fafb';
        const GRAY_200 = '#e5e7eb';
        const TEXT_PRIMARY = '#0f172a';
        const TEXT_SECONDARY = '#64748b';
        const MARGIN_LEFT = 50;
        const CONTENT_WIDTH = 495;

        const now = new Date();
        const dateStr = now.toLocaleDateString('pt-BR');
        const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

        // Hero header
        doc.rect(0, 0, 595, 120).fill(BLUE_PRIMARY);
        doc.fontSize(28).fillColor('#ffffff').font('Helvetica-Bold').text('DASHBOARD', MARGIN_LEFT, 28);
        doc.fontSize(9).fillColor('#bfdbfe').text('Relatório Executivo', MARGIN_LEFT, 70);
        doc.fontSize(8).fillColor('#cbd5e1').text(`${dateStr} • ${timeStr}`, MARGIN_LEFT, 88);

        // small filters area
        let y = 140;
        doc.fontSize(9).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text('PERÍODO E FILTROS', MARGIN_LEFT, y);
        y += 14;
        doc.fontSize(8).fillColor(TEXT_SECONDARY).font('Helvetica');
        const periodoLabel = payload.periodo || '';
        if (periodoLabel) doc.text(`Período: ${periodoLabel}`, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
        y = doc.y + 8;

        // KPIs (from payload.summary)
        const summary = payload.summary || {};
          // compute ticketMedio: prefer payload, else try compute from payload.monthlyFaturamento/summary, else fallback to DB AVG
          const formatMoney = (v) => `R$ ${Number(v || 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`;

          let ticketMedioVal = Number(payload.ticketMedio || 0);
          if (!ticketMedioVal) {
            // try compute from payload.monthlyFaturamento and summary
            try {
              const mf = Array.isArray(payload.monthlyFaturamento) ? payload.monthlyFaturamento : (payload.monthly || []);
              const d = mf.reduce((s, r) => s + Number((r && (r.total || r.total_valor || r.valor)) || 0), 0);
              const totalOrd = Number(summary.total || 0);
              if (totalOrd > 0) {
                ticketMedioVal = soma / totalOrd;
              }
            } catch (e) {
              ticketMedioVal = 0;
            }
          }

          // final fallback: query DB AVG
          if (!ticketMedioVal) {
            try {
              const [[{ avg_ticket }]] = await pool.query(`SELECT COALESCE(AVG(valor),0) AS avg_ticket FROM ordens_servico`);
              ticketMedioVal = Number(avg_ticket || 0);
            } catch (e) {
              ticketMedioVal = 0;
            }
          }

          const kpis = [
            { title: 'TOTAL', value: summary.total || 0 },
            { title: 'ORDENS', value: summary.status_counts ? Object.values(summary.status_counts).reduce((s, n) => s + Number(n || 0), 0) : 0 },
            { title: 'TICKET MÉDIO', value: ticketMedioVal, format: 'currency' },
          ];

        const kpiW = (CONTENT_WIDTH - 10) / 3;
        const kpiH = 60;

        doc.fontSize(10).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text('RESUMO EXECUTIVO', MARGIN_LEFT, y);
        y += 16;

        kpis.forEach((k, idx) => {
          const x = MARGIN_LEFT + idx * (kpiW + 5);
          doc.rect(x, y, kpiW, kpiH).fillAndStroke(GRAY_50, GRAY_200);
          doc.fontSize(7).fillColor(TEXT_SECONDARY).font('Helvetica').text(k.title, x + 8, y + 8);
          const display = k.format === 'currency' ? formatMoney(k.value) : String(k.value);
          doc.fontSize(14).font('Helvetica-Bold').fillColor(BLUE_DARK).text(display, x + 8, y + 24);
        });

        y += kpiH + 18;

        // Top Clientes table
        const topClientes = payload.topClientes || [];
        if (topClientes.length) {
          doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('TOP CLIENTES', MARGIN_LEFT, y);
          y += 14;

          // header
          doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, 22).fillAndStroke('#f3f4f6', GRAY_200);
          doc.fontSize(9).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text('Cliente', MARGIN_LEFT + 8, y + 6);
          doc.fontSize(9).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text('Total (R$)', MARGIN_LEFT + CONTENT_WIDTH - 90, y + 6, { width: 80, align: 'right' });
          y += 26;

          topClientes.slice(0, 8).forEach((c) => {
            doc.fontSize(9).font('Helvetica').fillColor(TEXT_PRIMARY).text(String(c.nome || ''), MARGIN_LEFT + 8, y);
            const totalStr = typeof c.total !== 'undefined' ? Number(c.total).toLocaleString('pt-BR', { minimumFractionDigits: 2 }) : '';
            doc.fontSize(9).font('Helvetica').fillColor(TEXT_PRIMARY).text(totalStr, MARGIN_LEFT + CONTENT_WIDTH - 90, y, { width: 80, align: 'right' });
            y += 18;
            if (y > 720) {
              doc.addPage();
              y = 50;
            }
          });

          y += 8;
        }

        // Tipo de Serviços small table
        const tipoServicos = payload.tipoServicos || [];
        if (tipoServicos.length) {
          doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('TIPO DE SERVIÇOS', MARGIN_LEFT, y);
          y += 14;

          tipoServicos.slice(0, 10).forEach((t) => {
            doc.fontSize(9).font('Helvetica').fillColor(TEXT_PRIMARY).text(String(t.tipo || ''), MARGIN_LEFT + 8, y);
            doc.fontSize(9).font('Helvetica').fillColor(TEXT_PRIMARY).text(String(t.total || ''), MARGIN_LEFT + CONTENT_WIDTH - 40, y, { width: 32, align: 'right' });
            y += 16;
            if (y > 720) {
              doc.addPage();
              y = 50;
            }
          });
        }

        // Footer - simple
        const bottom = 760;
        doc.lineWidth(0.5).strokeColor(GRAY_200).moveTo(MARGIN_LEFT, bottom).lineTo(MARGIN_LEFT + CONTENT_WIDTH, bottom).stroke();
        doc.fontSize(8).fillColor(TEXT_SECONDARY).text(`Gerado em ${dateStr} às ${timeStr}`, MARGIN_LEFT, bottom + 6, { align: 'center', width: CONTENT_WIDTH });

        doc.end();
        return;
      }

      return res.status(400).json({ success: false, message: 'Formato não suportado' });
    } catch (error) {
      next(error);
    }
  }

}

module.exports = new DashboardController();