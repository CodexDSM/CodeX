const db = require('../config/database');
const PDFDocument = require('pdfkit');

const BLUE_PRIMARY = '#2563eb';
const BLUE_DARK = '#1d4ed8';
const BLUE_LIGHT = '#eff6ff';
const GRAY_50 = '#f9fafb';
const GRAY_100 = '#f3f4f6';
const GRAY_200 = '#e5e7eb';
const GRAY_300 = '#d1d5db';
const TEXT_PRIMARY = '#0f172a';
const TEXT_SECONDARY = '#64748b';
const SUCCESS = '#10b981';

const MARGIN_LEFT = 50;
const MARGIN_RIGHT = 50;
const MARGIN_TOP = 50;
const MARGIN_BOTTOM = 50;
const CONTENT_WIDTH = 495;

const formatMoney = (value) => `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;
const formatDate = (dateStr) => {
  if (!dateStr) return '-';
  return new Date(dateStr).toLocaleDateString('pt-BR');
};

exports.relatorioFaturamentos = async (req, res) => {
  const { cliente_id, vendedor_id, from, to, format } = req.body || {};
  const params = [];

  let q =
    'SELECT ' +
    '  f.id, ' +
    '  f.frete_id AS frete_id, ' +
    '  fr.codigo AS frete_codigo, ' +
    '  f.cliente_id AS cliente_id, ' +
    '  c.nome AS cliente_nome, ' +
    '  f.vendedor_id AS vendedor_id, ' +
    '  col.nome AS vendedor_nome, ' +
    '  f.valor, ' +
    '  f.tipo, ' +
    '  f.referencia, ' +
    '  f.observacoes, ' +
    '  f.criado_em, ' +
    '  vwf.origem, ' +
    '  vwf.destino, ' +
    '  vwf.motorista_id, ' +
    '  vwf.motorista AS motorista_nome, ' +
    '  vwf.veiculo, ' +
    '  vwf.data_coleta, ' +
    '  vwf.data_entrega, ' +
    '  vwf.data_entrega_prevista ' +
    'FROM faturamentos f ' +
    'LEFT JOIN frete fr ON fr.id = f.frete_id ' +
    'LEFT JOIN vw_resumo_fretes vwf ON vwf.id = fr.id ' +
    'LEFT JOIN cliente c ON c.id = f.cliente_id ' +
    'LEFT JOIN colaborador col ON col.id = f.vendedor_id ' +
    'WHERE 1=1';

  if (cliente_id) {
    q += ' AND (f.cliente_id = ? OR c.nome LIKE ?)';
    params.push(cliente_id, `%${cliente_id}%`);
  }

  if (vendedor_id) {
    q += ' AND (f.vendedor_id = ? OR col.nome LIKE ?)';
    params.push(vendedor_id, `%${vendedor_id}%`);
  }

  if (from) {
    q += ' AND DATE(f.criado_em) >= ?';
    params.push(from);
  }

  if (to) {
    q += ' AND DATE(f.criado_em) <= ?';
    params.push(to);
  }

  q += ' ORDER BY f.criado_em DESC';

  try {
    const [rows] = await db.execute(q, params);

    if (format === 'csv') {
      if (!rows.length) {
        return res.set('Content-Type', 'text/csv').send('');
      }
      const header = Object.keys(rows[0]).join(',');
      const lines = rows.map((r) =>
        Object.values(r)
          .map((v) => `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`)
          .join(',')
      );
      return res
        .set('Content-Type', 'text/csv')
        .send([header, ...lines].join('\n'));
    }

    if (format === 'pdf') {
      const doc = new PDFDocument({ size: 'A4', margin: 0, lineGap: 2 });
      const chunks = [];

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'attachment; filename="relatorio-faturamentos.pdf"');

      doc.on('data', (chunk) => chunks.push(chunk));
      doc.on('end', () => {
        const pdfBuffer = Buffer.concat(chunks);
        res.end(pdfBuffer);
      });

      const total = rows.reduce((s, r) => s + parseFloat(r.valor || 0), 0);
      const now = new Date();
      const dateStr = now.toLocaleDateString('pt-BR');
      const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

      // PAGE 1: HEADER + KPIs
      // Hero Header
      doc.rect(0, 0, 595, 110).fill(BLUE_PRIMARY);
      doc.fontSize(32).font('Helvetica-Bold').fillColor('#ffffff').text('FATURAMENTOS', MARGIN_LEFT, 25);
      doc.fontSize(10).fillColor('#bfdbfe').text('Relatório Executivo', MARGIN_LEFT, 65);
      doc.fontSize(8).fillColor('#cbd5e1').text(`${dateStr} • ${timeStr}`, MARGIN_LEFT, 80);

      let y = MARGIN_TOP + 70;

      // Filtros
      doc.fontSize(9).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('PERÍODO E FILTROS', MARGIN_LEFT, y);
      y += 16;

      doc.fontSize(8).fillColor(TEXT_SECONDARY).font('Helvetica');
      const periodoLabel =
        from && to
          ? `${from} até ${to}`
          : from
          ? `a partir de ${from}`
          : to
          ? `até ${to}`
          : 'período completo';
      doc.text(`Período: ${periodoLabel}`, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
      y = doc.y + 2;
      if (cliente_id) {
        doc.text(`Cliente: ${cliente_id}`, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
        y = doc.y + 2;
      }
      if (vendedor_id) {
        doc.text(`Vendedor: ${vendedor_id}`, MARGIN_LEFT, y, { width: CONTENT_WIDTH });
        y = doc.y + 2;
      }

      y += 8;
      doc.lineWidth(0.5).strokeColor(GRAY_200).moveTo(MARGIN_LEFT, y).lineTo(MARGIN_LEFT + CONTENT_WIDTH, y).stroke();
      y += 14;

      // KPIs Grid
      doc.fontSize(10).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('RESUMO EXECUTIVO', MARGIN_LEFT, y);
      y += 16;

      const kpiW = (CONTENT_WIDTH - 10) / 3;
      const kpiH = 65;
      const kpiGap = 5;

      const drawKpi = (x, title, value, subtitle) => {
        doc.rect(x, y, kpiW, kpiH).fillAndStroke(GRAY_50, GRAY_200);
        doc.fontSize(7).fillColor(TEXT_SECONDARY).font('Helvetica').text(title, x + 8, y + 8);
        doc.fontSize(12).font('Helvetica-Bold').fillColor(BLUE_DARK).text(value, x + 8, y + 22);
        if (subtitle) doc.fontSize(6).fillColor(TEXT_SECONDARY).text(subtitle, x + 8, y + 50);
      };

      const avgValue = rows.length ? (total / rows.length).toFixed(2).replace('.', ',') : '0,00';
      const maxValue = rows.length ? Math.max(...rows.map(r => parseFloat(r.valor || 0))).toFixed(2).replace('.', ',') : '0,00';
      const minValue = rows.length ? Math.min(...rows.map(r => parseFloat(r.valor || 0))).toFixed(2).replace('.', ',') : '0,00';

      drawKpi(MARGIN_LEFT, 'TOTAL GERAL', formatMoney(total), '');
      drawKpi(MARGIN_LEFT + kpiW + kpiGap, 'QUANTIDADE', rows.length.toString(), 'faturamentos');
      drawKpi(MARGIN_LEFT + 2 * (kpiW + kpiGap), 'TICKET MÉDIO', `R$ ${avgValue}`, '');

      y += kpiH + 12;

      drawKpi(MARGIN_LEFT, 'MAIOR VALOR', `R$ ${maxValue}`, '');
      drawKpi(MARGIN_LEFT + kpiW + kpiGap, 'MENOR VALOR', `R$ ${minValue}`, '');
      drawKpi(MARGIN_LEFT + 2 * (kpiW + kpiGap), 'TOTAL', rows.length.toString(), 'registros');

      y += kpiH + 14;

      if (rows.length === 0) {
        doc.fontSize(11).fillColor(TEXT_SECONDARY).text('Nenhum faturamento encontrado.', MARGIN_LEFT, y, { align: 'center' });
        doc.end();
        return;
      }

      // PAGE 2: CHARTS
      doc.addPage();
      y = MARGIN_TOP;

      // Analysis data
      const porDia = {};
      const porCliente = {};
      const porVendedor = {};

      rows.forEach((r) => {
        const d = r.criado_em ? new Date(r.criado_em) : null;
        const diaKey = d ? d.toISOString().slice(0, 10) : 'Sem data';
        const clienteKey = r.cliente_nome || r.cliente_id || 'Sem cliente';
        const vendedorKey = r.vendedor_nome || r.vendedor_id || 'Sem vendedor';

        porDia[diaKey] = (porDia[diaKey] || 0) + parseFloat(r.valor || 0);
        porCliente[clienteKey] = (porCliente[clienteKey] || 0) + parseFloat(r.valor || 0);
        porVendedor[vendedorKey] = (porVendedor[vendedorKey] || 0) + parseFloat(r.valor || 0);
      });

      const diasOrdenados = Object.keys(porDia).sort((a, b) => (a > b ? 1 : -1));
      const clientesTop = Object.entries(porCliente)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);
      const vendedoresTop = Object.entries(porVendedor)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 5);

      // Chart 1: Daily Revenue
      if (diasOrdenados.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('FATURAMENTO DIÁRIO', MARGIN_LEFT, y);
        y += 14;

        const chartX = MARGIN_LEFT;
        const chartY = y;
        const chartW = CONTENT_WIDTH;
        const chartH = 130;

        doc.rect(chartX, chartY, chartW, chartH).fillAndStroke(BLUE_LIGHT, BLUE_PRIMARY);

        const maxDia = Math.max(...Object.values(porDia));
        const minDia = Math.min(...Object.values(porDia));
        const rangeDia = maxDia - minDia || maxDia;

        // Axes
        doc.lineWidth(1).strokeColor(BLUE_DARK);
        const axisX = chartX + 40;
        const axisY = chartY + chartH - 20;
        doc.moveTo(axisX, chartY + 10).lineTo(axisX, axisY).stroke();
        doc.moveTo(axisX, axisY).lineTo(chartX + chartW - 15, axisY).stroke();

        // Y labels
        doc.fontSize(6).fillColor(BLUE_DARK);
        for (let i = 0; i <= 5; i++) {
          const val = minDia + (i / 5) * rangeDia;
          const yPos = axisY - (i / 5) * (chartH - 30);
          doc.text(`${(val / 1000).toFixed(0)}k`, chartX + 5, yPos - 3, { width: 32, align: 'right' });
        }

        // Bars
        const numBars = Math.min(diasOrdenados.length, 11);
        const barSpacing = (chartW - 60) / (numBars + 1);
        const displayDias = diasOrdenados.slice(-numBars);

        displayDias.forEach((dia, idx) => {
          const valor = porDia[dia];
          const normalized = rangeDia > 0 ? (valor - minDia) / rangeDia : 0;
          const barH = Math.max(3, normalized * (chartH - 30));
          const barX = axisX + 15 + idx * barSpacing;
          const barY = axisY - barH;

          doc.rect(barX, barY, barSpacing - 8, barH).fillAndStroke(BLUE_PRIMARY, BLUE_DARK);

          const [, month, day] = dia.split('-');
          doc.fontSize(6).fillColor(BLUE_DARK).text(`${day}/${month}`, barX - 3, axisY + 4, { width: barSpacing, align: 'center' });
        });

        y = chartY + chartH + 18;
      }

      // Chart 2: Top Clients
      if (clientesTop.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('PRINCIPAIS CLIENTES', MARGIN_LEFT, y);
        y += 14;

        const maxCliente = Math.max(...clientesTop.map(([, v]) => v));
        const barH = 20;
        const barGap = 5;

        clientesTop.forEach(([cliente, valor], idx) => {
          const barW = (CONTENT_WIDTH - 140) * (valor / maxCliente);
          doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, barH).fillAndStroke(GRAY_50, GRAY_200);
          doc.rect(MARGIN_LEFT, y, barW, barH).fillAndStroke(BLUE_PRIMARY, BLUE_DARK);

          doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');
          const nameLen = cliente.length > 35 ? cliente.substring(0, 32) + '...' : cliente;
          doc.text(nameLen, MARGIN_LEFT + 8, y + 4);

          doc.fontSize(8).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text(formatMoney(valor), MARGIN_LEFT + CONTENT_WIDTH - 85, y + 4, { width: 80, align: 'right' });

          y += barH + barGap;
        });

        y += 8;
      }

      // PAGE 3: TOP SALESMEN
      doc.addPage();
      y = MARGIN_TOP;

      if (vendedoresTop.length > 0) {
        doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('PRINCIPAIS VENDEDORES', MARGIN_LEFT, y);
        y += 14;

        const maxVendedor = Math.max(...vendedoresTop.map(([, v]) => v));
        const barH = 20;
        const barGap = 5;

        vendedoresTop.forEach(([vendedor, valor], idx) => {
          const barW = (CONTENT_WIDTH - 140) * (valor / maxVendedor);
          doc.rect(MARGIN_LEFT, y, CONTENT_WIDTH, barH).fillAndStroke(GRAY_50, GRAY_200);
          doc.rect(MARGIN_LEFT, y, barW, barH).fillAndStroke(SUCCESS, '#059669');

          doc.fontSize(8).font('Helvetica-Bold').fillColor('#ffffff');
          const vendName = vendedor.length > 35 ? vendedor.substring(0, 32) + '...' : vendedor;
          doc.text(vendName, MARGIN_LEFT + 8, y + 4);

          doc.fontSize(8).fillColor(TEXT_PRIMARY).font('Helvetica-Bold').text(formatMoney(valor), MARGIN_LEFT + CONTENT_WIDTH - 85, y + 4, { width: 80, align: 'right' });

          y += barH + barGap;
        });

        y += 14;
      }

      // PAGE 4: DATA TABLE
      doc.addPage();
      y = MARGIN_TOP;

      doc.fontSize(11).font('Helvetica-Bold').fillColor(TEXT_PRIMARY).text('DETALHAMENTO COMPLETO', MARGIN_LEFT, y);
      y += 14;

      const col1 = MARGIN_LEFT;
      const col2 = MARGIN_LEFT + 85;
      const col3 = MARGIN_LEFT + 180;
      const col4 = MARGIN_LEFT + 295;
      const col5 = MARGIN_LEFT + 410;
      const rowH = 14;

      // Table Header
      doc.rect(col1, y, CONTENT_WIDTH, rowH).fillAndStroke(BLUE_PRIMARY, BLUE_DARK);
      doc.fontSize(7).font('Helvetica-Bold').fillColor('#ffffff');
      doc.text('Frete', col1 + 4, y + 4, { width: col2 - col1 - 8, align: 'left' });
      doc.text('Cliente', col2 + 4, y + 4, { width: col3 - col2 - 8, align: 'left' });
      doc.text('Vendedor', col3 + 4, y + 4, { width: col4 - col3 - 8, align: 'left' });
      doc.text('Valor', col4 + 4, y + 4, { width: col5 - col4 - 8, align: 'right' });
      doc.text('Data', col5 + 4, y + 4, { width: 90, align: 'left' });

      y += rowH + 2;

      const maxTableRows = Math.floor((740 - y) / rowH);
      const displayRows = rows.slice(0, maxTableRows);

      displayRows.forEach((r, idx) => {
        const bgColor = idx % 2 === 0 ? '#ffffff' : GRAY_50;
        doc.rect(col1, y, CONTENT_WIDTH, rowH).fill(bgColor);
        doc.rect(col1, y, CONTENT_WIDTH, rowH).stroke(GRAY_200);

        doc.fontSize(7).fillColor(TEXT_PRIMARY).font('Helvetica');
        doc.text(r.frete_codigo || '-', col1 + 4, y + 3, { width: col2 - col1 - 8, align: 'left' });
        doc.text((r.cliente_nome || '-').substring(0, 16), col2 + 4, y + 3, { width: col3 - col2 - 8, align: 'left' });
        doc.text((r.vendedor_nome || '-').substring(0, 16), col3 + 4, y + 3, { width: col4 - col3 - 8, align: 'left' });
        doc.text(formatMoney(r.valor), col4 + 4, y + 3, { width: col5 - col4 - 8, align: 'right' });
        doc.text(formatDate(r.criado_em), col5 + 4, y + 3, { width: 90, align: 'left' });

        y += rowH + 1;
      });

      if (rows.length > maxTableRows) {
        doc.fontSize(7).fillColor(TEXT_SECONDARY).text(`... e mais ${rows.length - maxTableRows} registros`, MARGIN_LEFT + 4, y + 6);
      }

      // Footer
      y = 740;
      doc.lineWidth(0.5).strokeColor(GRAY_200).moveTo(MARGIN_LEFT, y).lineTo(MARGIN_LEFT + CONTENT_WIDTH, y).stroke();
      doc.fontSize(6).fillColor(TEXT_SECONDARY).text(`Gerado em ${dateStr} às ${timeStr}`, MARGIN_LEFT, y + 6, { align: 'center', width: CONTENT_WIDTH });

      doc.end();
      return;
    }

    const total = rows.reduce((s, r) => s + parseFloat(r.valor || 0), 0);
    return res.json({ rows, total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
