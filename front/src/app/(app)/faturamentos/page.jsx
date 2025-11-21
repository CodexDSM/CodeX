'use client';

import { useEffect, useMemo, useState } from 'react';
import { getApiUrl, getAuthHeaders } from '@/lib/apiConfig';
import { FaturamentoDetalhesModal } from './modalFaturamento';
import styles from './faturamentos.module.css';

const formatMoney = (value) =>
  `R$ ${Number(value || 0).toFixed(2).replace('.', ',')}`;

const todayISO = new Date().toISOString().slice(0, 10);

const getMonthStart = () => {
  const d = new Date();
  d.setDate(1);
  return d.toISOString().slice(0, 10);
};

export default function FaturamentosPage() {
  const [rows, setRows] = useState([]);
  const [total, setTotal] = useState(0);

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [exportLoading, setExportLoading] = useState(false);
  const [exportError, setExportError] = useState('');

  const [pdfLoading, setPdfLoading] = useState(false);
  const [pdfError, setPdfError] = useState('');

  const [period, setPeriod] = useState('month');
  const [from, setFrom] = useState(getMonthStart());
  const [to, setTo] = useState(todayISO);
  const [clienteFilter, setClienteFilter] = useState('');
  const [vendedorFilter, setVendedorFilter] = useState('');

  const [isDirty, setIsDirty] = useState(false);
  const [dateError, setDateError] = useState('');

  const [faturamentoSelecionado, setFaturamentoSelecionado] = useState(null);

  const baseBody = useMemo(() => {
    const body = {};

    if (period === 'today') {
      body.from = todayISO;
      body.to = todayISO;
    } else if (period === '7d') {
      const d = new Date();
      d.setDate(d.getDate() - 7);
      body.from = d.toISOString().slice(0, 10);
      body.to = todayISO;
    } else if (period === 'month') {
      body.from = getMonthStart();
      body.to = todayISO;
    } else if (period === 'custom') {
      if (from) body.from = from;
      if (to) body.to = to;
    }

    if (clienteFilter.trim()) {
      body.cliente_id = clienteFilter.trim();
    }

    if (vendedorFilter.trim()) {
      body.vendedor_id = vendedorFilter.trim();
    }

    return body;
  }, [period, from, to, clienteFilter, vendedorFilter]);

  const validateDates = () => {
    if (period !== 'custom') {
      setDateError('');
      return true;
    }

    if (!from || !to) {
      setDateError('Informe as duas datas para o período personalizado.');
      return false;
    }

    if (from > to) {
      setDateError('A data inicial não pode ser maior que a data final.');
      return false;
    }

    setDateError('');
    return true;
  };

  const loadData = async () => {
    if (!validateDates()) return;

    setLoading(true);
    setError('');

    try {
      const body = { ...baseBody };

      const res = await fetch(getApiUrl('/faturamentos/relatorio'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        setRows([]);
        setTotal(0);
        setError(msg || 'Erro ao carregar faturamentos');
        return;
      }

      const data = await res.json();
      const newRows = Array.isArray(data.rows) ? data.rows : [];
      const newTotal = Number(data.total || 0);

      setRows(newRows);
      setTotal(newTotal);
      setIsDirty(false);
    } catch (e) {
      setRows([]);
      setTotal(0);
      setError('Falha na requisição de faturamentos');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    loadData();
  };

  const periodLabel = () => {
    if (period === 'today') return ' ';
    if (period === '7d') return ' ';
    if (period === 'month') return ' ';
    return ' ';
  };

  const abrirDetalhesFaturamento = (row) => {
    setFaturamentoSelecionado(row);
  };

  const fecharDetalhesFaturamento = () => {
    setFaturamentoSelecionado(null);
  };

  const handleChangePeriod = (novo) => {
    setPeriod(novo);
    setIsDirty(true);

    if (novo !== 'custom') {
      setFrom(getMonthStart());
      setTo(todayISO);
    }
  };

  const handleLimparFiltros = () => {
    setPeriod('month');
    setFrom(getMonthStart());
    setTo(todayISO);
    setClienteFilter('');
    setVendedorFilter('');
    setIsDirty(true);
    setDateError('');
  };

  const handleChangeFrom = (value) => {
    setFrom(value);
    setIsDirty(true);
  };

  const handleChangeTo = (value) => {
    setTo(value);
    setIsDirty(true);
  };

  const handleChangeCliente = (value) => {
    setClienteFilter(value);
    setIsDirty(true);
  };

  const handleChangeVendedor = (value) => {
    setVendedorFilter(value);
    setIsDirty(true);
  };

  const handleExportCsv = async () => {
    if (!validateDates()) return;

    setExportLoading(true);
    setExportError('');

    try {
      const body = { ...baseBody, format: 'csv' };

      const res = await fetch(getApiUrl('/faturamentos/relatorio'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        setExportError(msg || 'Erro ao exportar CSV');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(
        now.getHours()
      ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      link.href = url;
      link.download = `faturamentos_${timestamp}.csv`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setExportError('Falha na exportação de faturamentos');
    } finally {
      setExportLoading(false);
    }
  };

  const handleExportPdf = async () => {
    if (!validateDates()) return;

    setPdfLoading(true);
    setPdfError('');

    try {
      const body = { ...baseBody, format: 'pdf' };

      const res = await fetch(getApiUrl('/faturamentos/relatorio'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const msg = await res.text();
        setPdfError(msg || 'Erro ao exportar PDF');
        return;
      }

      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const link = document.createElement('a');
      const now = new Date();
      const timestamp = `${now.getFullYear()}-${String(
        now.getMonth() + 1
      ).padStart(2, '0')}-${String(now.getDate()).padStart(2, '0')}_${String(
        now.getHours()
      ).padStart(2, '0')}${String(now.getMinutes()).padStart(2, '0')}`;
      link.href = url;
      link.download = `relatorio_faturamentos_${timestamp}.pdf`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      window.URL.revokeObjectURL(url);
    } catch (e) {
      setPdfError('Falha na exportação de PDF');
    } finally {
      setPdfLoading(false);
    }
  };

  return (
    <>
      <div className={styles.page}>
        <header className={styles.header}>
          <div>
            <h1 className={styles.title}>Faturamentos</h1>
            <p className={styles.subtitle}>
              Lista simples de faturamentos gerados a partir dos fretes concluídos.
            </p>
          </div>
          <div className={styles.headerInfo}>
            <div className={styles.headerInfoLabel}>Total geral</div>
            <div className={styles.headerInfoValue}>{formatMoney(total)}</div>
            <div className={styles.headerInfoMeta}>Registros: {rows.length}</div>
          </div>
        </header>

        <section className={styles.filtersCard}>
          <form onSubmit={handleSubmit} className={styles.filtersForm}>
            <div className={styles.filtersHeaderRow}>
              <div className={styles.periodRow}>
                <span className={styles.periodLabel}>Período:</span>

                <button
                  type="button"
                  onClick={() => handleChangePeriod('today')}
                  disabled={loading}
                  className={
                    period === 'today'
                      ? `${styles.chip} ${styles.chipActive}`
                      : styles.chip
                  }
                >
                  Hoje
                </button>

                <button
                  type="button"
                  onClick={() => handleChangePeriod('7d')}
                  disabled={loading}
                  className={
                    period === '7d'
                      ? `${styles.chip} ${styles.chipActive}`
                      : styles.chip
                  }
                >
                  Últimos 7 dias
                </button>

                <button
                  type="button"
                  onClick={() => handleChangePeriod('month')}
                  disabled={loading}
                  className={
                    period === 'month'
                      ? `${styles.chip} ${styles.chipActive}`
                      : styles.chip
                  }
                >
                  Este mês
                </button>

                <button
                  type="button"
                  onClick={() => handleChangePeriod('custom')}
                  disabled={loading}
                  className={
                    period === 'custom'
                      ? `${styles.chip} ${styles.chipActive}`
                      : styles.chip
                  }
                >
                  Personalizado
                </button>

                <span className={styles.periodHint}>{periodLabel()}</span>
              </div>

              <div className={styles.filtersHeaderActions}>
                <button
                  type="button"
                  onClick={handleLimparFiltros}
                  disabled={loading && !rows.length}
                  className={styles.buttonSecondary}
                >
                  Limpar filtros
                </button>

                <button
                  type="submit"
                  disabled={loading || !isDirty || !!dateError}
                  className={styles.buttonPrimary}
                >
                  {loading ? 'Carregando...' : 'Aplicar filtros'}
                </button>

                <button
                  type="button"
                  onClick={handleExportCsv}
                  disabled={exportLoading || !!dateError}
                  className={styles.buttonGhost}
                >
                  {exportLoading ? 'Exportando...' : 'Exportar CSV'}
                </button>

                <button
                  type="button"
                  onClick={handleExportPdf}
                  disabled={pdfLoading || !!dateError}
                  className={styles.buttonGhost}
                >
                  {pdfLoading ? 'Gerando PDF...' : 'Exportar PDF'}
                </button>
              </div>
            </div>

            <div className={styles.filtersGrid}>
              <div>
                <label className={styles.label}>Cliente (nome ou ID)</label>
                <input
                  type="text"
                  value={clienteFilter}
                  onChange={(e) => handleChangeCliente(e.target.value)}
                  placeholder="Digite para filtrar"
                  disabled={loading}
                  className={styles.input}
                />
              </div>

              <div>
                <label className={styles.label}>Vendedor (nome ou ID)</label>
                <input
                  type="text"
                  value={vendedorFilter}
                  onChange={(e) => handleChangeVendedor(e.target.value)}
                  placeholder="Digite para filtrar"
                  disabled={loading}
                  className={styles.input}
                />
              </div>

              <div>
                <label className={styles.label}>De</label>
                <input
                  type="date"
                  value={from}
                  onChange={(e) => handleChangeFrom(e.target.value)}
                  disabled={period !== 'custom' || loading}
                  className={
                    period === 'custom'
                      ? `${styles.input} ${dateError ? styles.inputError : ''}`
                      : `${styles.input} ${styles.inputDisabled}`
                  }
                />
              </div>

              <div>
                <label className={styles.label}>Até</label>
                <input
                  type="date"
                  value={to}
                  onChange={(e) => handleChangeTo(e.target.value)}
                  disabled={period !== 'custom' || loading}
                  className={
                    period === 'custom'
                      ? `${styles.input} ${dateError ? styles.inputError : ''}`
                      : `${styles.input} ${styles.inputDisabled}`
                  }
                />
              </div>
            </div>

            {dateError && <div className={styles.dateError}>{dateError}</div>}
          </form>
        </section>

        {error && <div className={styles.errorBox}>{error}</div>}
        {exportError && <div className={styles.errorBox}>{exportError}</div>}
        {pdfError && <div className={styles.errorBox}>{pdfError}</div>}

        <section className={styles.tableCard}>
          <table className={styles.table}>
            <thead className={styles.tableHead}>
              <tr>
                <th className={styles.thFrete}>Frete</th>
                <th className={styles.thCliente}>Cliente</th>
                <th className={styles.thVendedor}>Vendedor</th>
                <th className={styles.thValor}>Valor</th>
                <th className={styles.thCriadoEm}>Criado em</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr
                  key={r.id}
                  onClick={() => abrirDetalhesFaturamento(r)}
                  className={styles.trClickable}
                >
                  <td className={styles.td}>
                    {r.frete_codigo || r.frete_id || '-'}
                  </td>
                  <td className={styles.td}>
                    {r.cliente_nome || r.cliente_id || '-'}
                  </td>
                  <td className={styles.td}>
                    {r.vendedor_nome || r.vendedor_id || '-'}
                  </td>
                  <td className={`${styles.td} ${styles.tdRight}`}>
                    {formatMoney(r.valor)}
                  </td>
                  <td className={styles.td}>
                    {r.criado_em
                      ? new Date(r.criado_em).toLocaleString('pt-BR')
                      : '-'}
                  </td>
                </tr>
              ))}

              {!loading && !rows.length && (
                <tr>
                  <td colSpan={5} className={styles.emptyState}>
                    Nenhum faturamento encontrado para os filtros selecionados.
                  </td>
                </tr>
              )}

              {loading && (
                <tr>
                  <td colSpan={5} className={styles.loadingState}>
                    Carregando...
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </section>
      </div>

      {faturamentoSelecionado && (
        <FaturamentoDetalhesModal
          faturamento={faturamentoSelecionado}
          onClose={fecharDetalhesFaturamento}
        />
      )}
    </>
  );
}
