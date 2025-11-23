const pool = require('../config/database');
const PDFDocument = require('pdfkit');

// PDF style constants (aligned with faturamentos)
const BLUE_PRIMARY = '#2563eb';
const BLUE_DARK = '#1d4ed8';
const BLUE_LIGHT = '#eff6ff';
const GRAY_50 = '#f9fafb';
const GRAY_200 = '#e5e7eb';
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#64748b';
const MARGIN_LEFT = 48;
const CONTENT_WIDTH = 495;

class LocalizacaoController {
  async create(req, res, next) {
    try {
      const { colaborador_id, tipo_localizacao } = req.body;
      const usuarioLogado = req.user;

      if (usuarioLogado.perfil !== 'Administrador' && 
          usuarioLogado.perfil !== 'Gerente' && 
          usuarioLogado.id !== parseInt(colaborador_id)) {
        return res.status(403).json({ 
          error: 'Acesso negado. Você só pode registrar sua própria localização.' 
        });
      }

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

  async relatorio(req, res, next) {
    try {
      const { format } = req.body || {};

      // Query última localização por colaborador
      const [rows] = await pool.execute(`
        SELECT
          l.id,
          l.colaborador_id,
          c.nome as colaborador_nome,
          l.tipo_localizacao,
          l.data_hora
        FROM localizacao_colaborador l
        INNER JOIN colaborador c ON l.colaborador_id = c.id
        INNER JOIN (
          SELECT colaborador_id, MAX(data_hora) as max_dt
          FROM localizacao_colaborador
          GROUP BY colaborador_id
        ) lm ON lm.colaborador_id = l.colaborador_id AND lm.max_dt = l.data_hora
        WHERE c.ativo = true
        ORDER BY c.nome ASC
      `);

      if (format === 'csv') {
        if (!rows.length) return res.set('Content-Type', 'text/csv').send('');
        const header = Object.keys(rows[0]).join(',');
        const lines = rows.map((r) =>
          Object.values(r)
            .map((v) => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`)
            .join(',')
        );
        return res.set('Content-Type', 'text/csv').send([header, ...lines].join('\n'));
      }

      if (format === 'pdf') {
        const doc = new PDFDocument({ size: 'A4', margin: 40 });
        const chunks = [];

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio-localizacoes.pdf"');

        doc.on('data', (chunk) => chunks.push(chunk));
        doc.on('end', () => {
          const pdfBuffer = Buffer.concat(chunks);
          res.end(pdfBuffer);
        });

        // Helper: draw header and footer
        function drawHeader(docInstance, titleText = 'RELATÓRIO') {
          const title = titleText;
          docInstance.save();
          // Hero header
          docInstance.rect(0, 0, docInstance.page.width, 110).fill(BLUE_PRIMARY);
          docInstance.fillColor('#ffffff').fontSize(40).font('Helvetica-Bold').text(title, MARGIN_LEFT, 26);
          docInstance.fontSize(12).fillColor('#bfdbfe').font('Helvetica').text('Relatório Executivo', MARGIN_LEFT, 70);
          docInstance.fontSize(9).fillColor('#cbd5e1').text(`${new Date().toLocaleDateString('pt-BR')} • ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`, MARGIN_LEFT, 88);
          docInstance.restore();
        }

        function drawFooter(docInstance) {
          const bottom = docInstance.page.height - 40;
          docInstance.fontSize(8).fillColor('#6b7280');
          docInstance.text(`Página ${docInstance.page.number}`, 0, bottom, { align: 'center' });
        }

        // Draw initial header and footer
        drawHeader(doc);
        drawFooter(doc);

        // Re-draw header/footer when new page is added
        doc.on('pageAdded', () => {
          drawHeader(doc);
          drawFooter(doc);
        });

        // Period & filters section (like faturamentos)
        const periodoLabel = (() => {
          const from = req.body && req.body.from;
          const to = req.body && req.body.to;
          if (from && to) return `${from} até ${to}`;
          if (from) return `a partir de ${from}`;
          if (to) return `até ${to}`;
          return 'período completo';
        })();

        let y = 120;
        doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('PERÍODO E FILTROS', MARGIN_LEFT, y);
        y += 14;
        doc.fontSize(8).font('Helvetica').fillColor(TEXT_SECONDARY).text(`Período: ${periodoLabel}`, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
        y = doc.y + 8;
        doc.moveTo(MARGIN_LEFT, y).lineTo(MARGIN_LEFT + CONTENT_WIDTH, y).strokeColor(GRAY_200).lineWidth(0.5).stroke();
        y += 12;

        // Summary KPIs (total + breakdown)
        const total = rows.length;
        const counts = { 'home office': 0, 'presencial': 0, 'evento': 0, 'treinamento': 0 };
        rows.forEach(r => {
          const v = (r.tipo_localizacao || '').toString().toLowerCase().replace(/_|-/g, ' ').trim();
          if (counts[v] !== undefined) counts[v]++;
        });

        // KPI grid (6 cards like faturamentos)
        const kpiH = 52;
        const kpiGap = 8;
        const boxW = (CONTENT_WIDTH - 20) / 3;

        const drawKpiCard = (x, title, value, subtitle) => {
          doc.rect(x, y, boxW, kpiH).fillAndStroke(GRAY_50, GRAY_200);
          doc.fontSize(8).fillColor(TEXT_SECONDARY).font('Helvetica').text(title, x + 8, y + 8);
          doc.fontSize(14).font('Helvetica-Bold').fillColor(BLUE_DARK).text(String(value), x + 8, y + 24);
          if (subtitle) doc.fontSize(7).fillColor(TEXT_SECONDARY).text(subtitle, x + 8, y + 40);
        };

        const kpi1X = MARGIN_LEFT;
        const kpi2X = MARGIN_LEFT + boxW + kpiGap;
        const kpi3X = MARGIN_LEFT + 2 * (boxW + kpiGap);

        // First row
        drawKpiCard(kpi1X, 'TOTAL GERAL', total, 'colaboradores');
        drawKpiCard(kpi2X, 'HOME OFFICE', counts['home office'], 'colaboradores');
        drawKpiCard(kpi3X, 'PRESENCIAL', counts['presencial'], 'colaboradores');

        y += kpiH + 12;

        // Second row
        drawKpiCard(kpi1X, 'EVENTOS', counts['evento'], 'registros');
        drawKpiCard(kpi2X, 'TREINAMENTO', counts['treinamento'], 'registros');
        const lastDt = rows.length ? new Date(Math.max(...rows.map(r => new Date(r.data_hora).getTime()))) : null;
        drawKpiCard(kpi3X, 'ÚLTIMA ATUALIZAÇÃO', lastDt ? lastDt.toLocaleString('pt-BR') : '-', 'data');

        y += kpiH + 18;

        // Table header styling
        const startX = MARGIN_LEFT;
        const colWidths = [60, 180, 120, 140]; // id, nome, tipo, data

        doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
        // header background
        doc.rect(startX - 4, y - 6, colWidths.reduce((a, b) => a + b, 0) + 8, 22).fill('#1f2937');

        doc.text('ID', startX, y, { width: colWidths[0] });
        doc.text('Colaborador', startX + colWidths[0], y, { width: colWidths[1] });
        doc.text('Tipo', startX + colWidths[0] + colWidths[1], y, { width: colWidths[2] });
        doc.text('Data/Hora', startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3] });

        y += 22;
        doc.font('Helvetica').fontSize(9).fillColor('#0f172a');

        rows.forEach((r, idx) => {
          if (y > doc.page.height - 100) {
            doc.addPage();
            y = 120;
            // redraw table header on new page
            doc.fontSize(9).font('Helvetica-Bold').fillColor('#ffffff');
            doc.rect(startX - 4, y - 6, colWidths.reduce((a, b) => a + b, 0) + 8, 22).fill('#1f2937');
            doc.text('ID', startX, y, { width: colWidths[0] });
            doc.text('Colaborador', startX + colWidths[0], y, { width: colWidths[1] });
            doc.text('Tipo', startX + colWidths[0] + colWidths[1], y, { width: colWidths[2] });
            doc.text('Data/Hora', startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3] });
            y += 22;
            doc.font('Helvetica').fontSize(9).fillColor('#0f172a');
          }

          const bg = idx % 2 === 0 ? '#ffffff' : '#f8fafc';
          doc.rect(startX - 4, y - 4, colWidths.reduce((a, b) => a + b, 0) + 8, 18).fill(bg);
          const dt = r.data_hora ? new Date(r.data_hora).toLocaleString('pt-BR') : '';
          doc.fillColor('#0f172a').text(String(r.id), startX, y, { width: colWidths[0] });
          doc.text(String(r.colaborador_nome || ''), startX + colWidths[0], y, { width: colWidths[1] });
          doc.text(String(r.tipo_localizacao || ''), startX + colWidths[0] + colWidths[1], y, { width: colWidths[2] });
          doc.text(dt, startX + colWidths[0] + colWidths[1] + colWidths[2], y, { width: colWidths[3] });
          y += 18;
        });

        doc.end();
        return;
      }

      // default JSON response
      return res.json({ rows, total: rows.length });
    } catch (error) {
      next({ status: 500, message: error.message });
    }
  }

  async getHistorico(req, res, next) {
    try {
      const { colaborador_id } = req.params;
      const usuarioLogado = req.user;

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

  async getAtual(req, res, next) {
    try {
      const { colaborador_id } = req.params;
      const usuarioLogado = req.user;

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

      if (tipo_localizacao) {
        query += ' AND l.tipo_localizacao = ?';
        params.push(tipo_localizacao);
      }

      if (data_inicio) {
        query += ' AND DATE(l.data_hora) >= ?';
        params.push(data_inicio);
      }

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

      const tiposLocalizacao = ['Presencial', 'Home_Office', 'Evento', 'Treinamento'];
      const resultado = tiposLocalizacao.map(tipo => {
        const estatistica = estatisticas.find(est => est.tipo_localizacao === tipo);
        return {
          tipo_localizacao: tipo,
          total_colaboradores: estatistica ? estatistica.total_colaboradores : 0,
          colaboradores: estatistica ? estatistica.colaboradores.split(', ') : []
        };
      });

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
