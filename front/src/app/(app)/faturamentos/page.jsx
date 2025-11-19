'use client';
import { useState } from 'react';
import { getApiUrl, getAuthHeaders } from '@/lib/apiConfig';

export default function FaturamentosPage() {
  const [clienteId, setClienteId] = useState('');
  const [vendedorId, setVendedorId] = useState('');
  const [from, setFrom] = useState('');
  const [to, setTo] = useState('');
  const [carregando, setCarregando] = useState(false);
  const [linhas, setLinhas] = useState([]);
  const [total, setTotal] = useState(0);

  const handleBuscar = async e => {
    e.preventDefault();
    setCarregando(true);
    try {
      const res = await fetch(getApiUrl('/faturamentos/relatorio'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cliente_id: clienteId || undefined,
          vendedor_id: vendedorId || undefined,
          from: from || undefined,
          to: to || undefined
        })
      });
      if (!res.ok) {
        console.error('Erro ao carregar faturamentos', await res.text());
        setLinhas([]);
        setTotal(0);
        return;
      }
      const data = await res.json();
      setLinhas(data.rows || []);
      setTotal(data.total || 0);
    } catch (err) {
      console.error('Falha na requisição de faturamentos', err);
      setLinhas([]);
      setTotal(0);
    } finally {
      setCarregando(false);
    }
  };

  const handleExportCsv = async () => {
    setCarregando(true);
    try {
      const res = await fetch(getApiUrl('/faturamentos/relatorio'), {
        method: 'POST',
        headers: getAuthHeaders(),
        body: JSON.stringify({
          cliente_id: clienteId || undefined,
          vendedor_id: vendedorId || undefined,
          from: from || undefined,
          to: to || undefined,
          format: 'csv'
        })
      });
      if (!res.ok) {
        console.error('Erro ao exportar CSV', await res.text());
        return;
      }
      const blob = await res.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = 'faturamentos.csv';
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);
    } catch (err) {
      console.error('Falha ao exportar CSV', err);
    } finally {
      setCarregando(false);
    }
  };

  return (
    <div style={{ padding: '24px' }}>
      <h1>Faturamentos</h1>

      <form
        onSubmit={handleBuscar}
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(0, 1fr))',
          gap: '12px',
          marginBottom: '16px'
        }}
      >
        <div>
          <label>Cliente ID</label>
          <input
            type="text"
            value={clienteId}
            onChange={e => setClienteId(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Vendedor ID</label>
          <input
            type="text"
            value={vendedorId}
            onChange={e => setVendedorId(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>De</label>
          <input
            type="date"
            value={from}
            onChange={e => setFrom(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div>
          <label>Até</label>
          <input
            type="date"
            value={to}
            onChange={e => setTo(e.target.value)}
            style={{ width: '100%' }}
          />
        </div>
        <div style={{ gridColumn: 'span 4', display: 'flex', gap: '8px' }}>
          <button type="submit" disabled={carregando}>
            {carregando ? 'Carregando...' : 'Buscar'}
          </button>
          <button
            type="button"
            onClick={handleExportCsv}
            disabled={carregando || !linhas.length}
          >
            Exportar CSV
          </button>
        </div>
      </form>

      <div style={{ marginBottom: '12px' }}>
        <strong>Total:</strong> R{' '}
        {total ? total.toFixed(2).replace('.', ',') : '0,00'}
      </div>

      <table
        style={{
          width: '100%',
          borderCollapse: 'collapse',
          fontSize: '14px'
        }}
      >
        <thead>
          <tr>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              ID
            </th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              Frete
            </th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              Cliente
            </th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              Vendedor
            </th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              Valor
            </th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              Tipo
            </th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              Referência
            </th>
            <th style={{ borderBottom: '1px solid #ccc', padding: '8px' }}>
              Criado em
            </th>
          </tr>
        </thead>
        <tbody>
          {linhas.map(l => (
            <tr key={l.id}>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {l.id}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {l.frete_id}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {l.cliente_id}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {l.vendedor_id}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                R{' '}
                {Number(l.valor || 0)
                  .toFixed(2)
                  .replace('.', ',')}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {l.tipo || '-'}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {l.referencia || '-'}
              </td>
              <td style={{ borderBottom: '1px solid #eee', padding: '8px' }}>
                {l.criado_em
                  ? new Date(l.criado_em).toLocaleString('pt-BR')
                  : '-'}
              </td>
            </tr>
          ))}
          {!linhas.length && !carregando && (
            <tr>
              <td
                colSpan={8}
                style={{ padding: '12px', textAlign: 'center', color: '#777' }}
              >
                Nenhum faturamento encontrado.
              </td>
            </tr>
          )}
        </tbody>
      </table>
    </div>
  );
}
