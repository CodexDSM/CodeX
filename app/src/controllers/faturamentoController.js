const db = require('../config/database');

exports.relatorioFaturamentos = async (req, res) => {
  const { cliente_id, vendedor_id, from, to, format } = req.body || {};
  const params = [];
  let q =
    'SELECT f.id, f.frete_id, f.cliente_id, f.vendedor_id, f.valor, f.tipo, f.referencia, f.observacoes, f.criado_em FROM faturamentos f WHERE 1=1';

  if (cliente_id) {
    q += ' AND f.cliente_id = ?';
    params.push(cliente_id);
  }
  if (vendedor_id) {
    q += ' AND f.vendedor_id = ?';
    params.push(vendedor_id);
  }
  if (from) {
    q += ' AND f.criado_em >= ?';
    params.push(from);
  }
  if (to) {
    q += ' AND f.criado_em <= ?';
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
      const lines = rows.map(r =>
        Object.values(r)
          .map(v =>
            `"${String(v === null || v === undefined ? '' : v).replace(/"/g, '""')}"`
          )
          .join(',')
      );
      return res
        .set('Content-Type', 'text/csv')
        .send([header, ...lines].join('\n'));
    }

    const total = rows.reduce((s, r) => s + parseFloat(r.valor || 0), 0);
    return res.json({ rows, total });
  } catch (err) {
    return res.status(500).json({ error: err.message });
  }
};
