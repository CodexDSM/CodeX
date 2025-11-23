"use client";

import React, { useEffect, useState } from 'react';
import { getApiUrl, getAuthHeaders } from '@/lib/apiConfig';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie, Doughnut } from 'react-chartjs-2';
import styles from './dashboards.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardsPage() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]); // fretes counts
  const [monthlyFaturamento, setMonthlyFaturamento] = useState([]); // faturamento values
  const [topClientes, setTopClientes] = useState([]);
  const [fakeMonthly, setFakeMonthly] = useState(false);

  // Novos estados para os gráficos solicitados
  const [tipoServicos, setTipoServicos] = useState([]);
  const [clienteShare, setClienteShare] = useState([]);
  const [evolucaoValores, setEvolucaoValores] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAll();
  }, []);

  async function fetchAll() {
    setLoading(true);
    // Executa em paralelo
    await Promise.all([
      fetchSummary(),
      fetchMonthly(),
      fetchMonthlyFaturamento(),
      fetchTopClientes(),
      fetchTipoServicos(),
      fetchClienteShare(),
      fetchEvolucaoValores()
    ]);
    setLoading(false);
  }

  // -------------------------
  // Summary (total ordens + status_counts)
  // -------------------------
  async function fetchSummary() {
    try {
      const res = await fetch(getApiUrl('dashboard/summary'), { headers: getAuthHeaders() });
      const json = await res.json();
      console.debug('[dashboard/summary] response:', json);
      if (res.status === 401 || res.status === 403) return;
      if (json && json.success && json.data) {
        // Aceita diferentes chaves: { total } ou { total_cotacoes } etc.
        const data = json.data;
        // Normalize - mantém o objeto original para status_counts
        setSummary({
          ...data,
          total: Number(data.total || data.total_ordens || data.total_cotacoes || 0),
          status_counts: data.status_counts || data.status || {}
        });
      } else {
        setSummary({ total: 0, status_counts: {} });
      }
    } catch (err) {
      console.error('Erro summary', err);
      setSummary({ total: 0, status_counts: {} });
    }
  }

  // -------------------------
  // Fretes (counts) - last 6 months
  // -------------------------
  async function fetchMonthly() {
    try {
      const res = await fetch(getApiUrl('dashboard/monthly-fretes'), { headers: getAuthHeaders() });
      const json = await res.json();
      console.debug('[dashboard/monthly-fretes] response:', json);
      if (res.status === 401 || res.status === 403) {
        const fallback = generateFakeMonthly(6);
        setMonthly(fallback);
        setFakeMonthly(true);
        return;
      }
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        setMonthly(json.data);
        setFakeMonthly(false);
      } else {
        const fallback = generateFakeMonthly(6);
        setMonthly(fallback);
        setFakeMonthly(true);
      }
    } catch (err) {
      console.error('Erro monthly', err);
      const fallback = generateFakeMonthly(6);
      setMonthly(fallback);
      setFakeMonthly(true);
    }
  }

  // -------------------------
  // Monthly faturamento (values) - last 12 months
  // -------------------------
  async function fetchMonthlyFaturamento() {
    try {
      const res = await fetch(getApiUrl('dashboard/monthly-faturamento'), { headers: getAuthHeaders() });
      const json = await res.json();
      console.debug('[dashboard/monthly-faturamento] response:', json);
      if (res.status === 401 || res.status === 403) {
        setMonthlyFaturamento([]);
        return;
      }
      if (json && json.success && Array.isArray(json.data)) {
        // aceita formas diferentes: { month, total } ou { month, total_valor }
        const normalized = json.data.map(r => ({
          month: r.month || r.mes || r.label,
          total: Number(r.total || r.total_valor || r.valor || 0)
        }));
        setMonthlyFaturamento(normalized);
      } else {
        setMonthlyFaturamento([]);
      }
    } catch (err) {
      console.error('Erro monthly faturamento', err);
      setMonthlyFaturamento([]);
    }
  }

  // -------------------------
  // Top clientes
  // -------------------------
  async function fetchTopClientes() {
    try {
      const res = await fetch(getApiUrl('dashboard/top-clientes'), { headers: getAuthHeaders() });
      const json = await res.json();
      console.debug('[dashboard/top-clientes] response:', json);
      if (res.status === 401 || res.status === 403) return;
      if (json && json.success) {
        // aceita array ou objeto
        const data = Array.isArray(json.data) ? json.data : (json.data ? [json.data] : []);
        const normalized = data.map(r => ({
          nome: r.nome || r.nome_cliente || r.client_name || 'Sem nome',
          total: Number(r.total || r.valor || r.total_valor || 0)
        }));
        setTopClientes(normalized);
      } else {
        setTopClientes([]);
      }
    } catch (err) {
      console.error('Erro top clientes', err);
      setTopClientes([]);
    }
  }

  // -------------------------
  // Tipo de serviços (usa /tipo-servico)
  // -------------------------
  async function fetchTipoServicos() {
    try {
      const res = await fetch(getApiUrl('dashboard/tipo-servico'), { headers: getAuthHeaders() });
      const json = await res.json();
      console.debug('[dashboard/tipo-servico] response:', json);
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        setTipoServicos(json.data.map(r => ({ tipo: r.tipo || r.tipo_servico || 'Indefinido', total: Number(r.total || r.count || 0) })));
      } else {
        // tentativa secundária: usar cotacoes-metrics.status (se existir)
        try {
          const alt = await fetch(getApiUrl('dashboard/cotacoes-metrics'), { headers: getAuthHeaders() });
          const altJson = await alt.json();
          console.debug('[dashboard/cotacoes-metrics] fallback response:', altJson);
          if (altJson && altJson.success && Array.isArray(altJson.data.status)) {
            setTipoServicos(altJson.data.status.map(s => ({ tipo: s.status || 'Outro', total: Number(s.cnt || s.total || 0) })));
            return;
          }
        } catch (e) {
          // ignore
        }
        setTipoServicos(generateFakeTipoServicos());
      }
    } catch (err) {
      console.error('Erro tipo servicos', err);
      setTipoServicos(generateFakeTipoServicos());
    }
  }

  // -------------------------
  // Cliente share (usa top-clientes)
  // -------------------------
  async function fetchClienteShare() {
    try {
      const res = await fetch(getApiUrl('dashboard/top-clientes'), { headers: getAuthHeaders() });
      const json = await res.json();
      console.debug('[dashboard/top-clientes for clienteShare] response:', json);
      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        const normalized = json.data.map(item => ({ nome_cliente: item.nome || item.nome_cliente || 'Sem nome', total: Number(item.total || item.valor || 0) }));
        setClienteShare(normalized);
      } else {
        setClienteShare(generateFakeClienteShare());
      }
    } catch (err) {
      console.error('Erro cliente share', err);
      setClienteShare(generateFakeClienteShare());
    }
  }

  // -------------------------
  // Evolução de valores -> evolucao-valores (corrigido)
  // -------------------------
  async function fetchEvolucaoValores() {
    try {
      const res = await fetch(getApiUrl('dashboard/evolucao-valores'), { headers: getAuthHeaders() });
      const json = await res.json();
      console.debug('[dashboard/evolucao-valores] response:', json);

      if (json && json.success && Array.isArray(json.data) && json.data.length > 0) {
        // aceita várias formas do backend
        const normalized = json.data.map(r => ({
          month: r.month || r.mes || r.label,
          total_valor: Number(r.total_valor || r.total || r.valor || 0)
        }));
        // Se houver apenas um ponto, normaliza para última janela de meses (gera zeros para meses faltantes)
        const filled = fillLastNMonths(normalized, 6);
        setEvolucaoValores(filled);
      } else {
        setEvolucaoValores(generateFakeEvolucao(6));
      }
    } catch (err) {
      console.error('Erro evolucao valores', err);
      setEvolucaoValores(generateFakeEvolucao(6));
    }
  }

  // -------------------------
  // Helpers / generators
  // -------------------------
  function generateFakeMonthly(months = 6) {
    const out = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toISOString().slice(0, 7);
      const value = Math.floor(Math.random() * 50 + 5);
      out.push({ month, total: value });
    }
    return out;
  }

  function generateFakeTipoServicos() {
    return [
      { tipo: 'Serviço A', total: 32 },
      { tipo: 'Serviço B', total: 18 },
      { tipo: 'Serviço C', total: 9 },
      { tipo: 'Serviço D', total: 4 },
    ];
  }

  function generateFakeClienteShare() {
    return [
      { nome_cliente: 'Cliente A', total: 120 },
      { nome_cliente: 'Cliente B', total: 80 },
      { nome_cliente: 'Cliente C', total: 50 },
      { nome_cliente: 'Outros', total: 30 },
    ];
  }

  function generateFakeEvolucao(months = 6) {
    const out = [];
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const month = d.toISOString().slice(0, 7);
      const valor = Math.floor(Math.random() * 5000 + 500);
      out.push({ month, total_valor: valor });
    }
    return out;
  }

  // Preenche últimos N meses (formato { month, total_valor }) com zeros quando faltar
  function fillLastNMonths(dataArray, months = 6) {
    const now = new Date();
    const map = {};
    dataArray.forEach(d => {
      const key = (d.month || d.mes || '').toString();
      if (key) map[key] = Number(d.total_valor || d.total || d.valor || 0);
    });
    const out = [];
    for (let i = months - 1; i >= 0; i--) {
      const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
      const key = d.toISOString().slice(0, 7);
      out.push({ month: key, total_valor: Number(map[key] || 0) });
    }
    return out;
  }

  // -------------------------
  // Derived KPI calculations
  // -------------------------
  const somaTotal = monthlyFaturamento.reduce((s, r) => s + Number(r.total || 0), 0);
  const totalOrdens = summary ? Number(summary.total || 0) : (loading ? '...' : 0);
  const ticketMedio = totalOrdens ? (somaTotal / totalOrdens) : 0;
  const maiorCliente = (topClientes && topClientes.length > 0) ? topClientes[0].nome : '-';

  // -------------------------
  // Chart datasets
  // -------------------------
  const statusData = {
    labels: summary ? Object.keys(summary.status_counts || {}) : [],
    datasets: [
      {
        data: summary ? Object.values(summary.status_counts || {}) : [],
        backgroundColor: ['#4F46E5', '#10B981', '#F59E0B', '#EF4444', '#6B7280'],
      },
    ],
  };

  const monthlyLabels = monthly.map(m => m.month);
  const monthlyDataset = {
    labels: monthlyLabels,
    datasets: [
      {
        label: 'Fretes por mês',
        data: monthly.map(m => Number(m.total || 0)),
        borderColor: '#4F46E5',
        backgroundColor: 'rgba(79,70,229,0.12)',
        tension: 0.2,
        fill: true,
      },
    ],
  };

  const top5 = (topClientes || []).slice().sort((a, b) => Number(b.total) - Number(a.total)).slice(0, 5);
  const topClientesDataset = {
    labels: top5.map(t => t.nome),
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: top5.map(t => Number(t.total || 0)),
        backgroundColor: '#06B6D4',
      },
    ],
  };

  // Tipo de serviço - gráfico de barras
  const tipoLabels = (tipoServicos || []).map(t => t.tipo);
  const tipoDataset = {
    labels: tipoLabels,
    datasets: [
      {
        label: 'Total de Serviços',
        data: (tipoServicos || []).map(t => Number(t.total || 0)),
        backgroundColor: ['#3b82f6', '#10b981', '#f59e0b', '#ef4444'],
      },
    ],
  };

  // Participação por cliente - Doughnut
  const clienteLabels = (clienteShare || []).map(c => c.nome_cliente);
  const clienteDataset = {
    labels: clienteLabels,
    datasets: [
      {
        data: (clienteShare || []).map(c => Number(c.total || 0)),
        backgroundColor: ['#6366f1', '#f43f5e', '#14b8a6', '#f97316', '#60a5fa'],
      },
    ],
  };

  // Evolução por valor (linha)
  const evolLabels = (evolucaoValores || []).map(e => e.month);
  const evolDataset = {
    labels: evolLabels,
    datasets: [
      {
        label: 'Valor total cotado',
        data: (evolucaoValores || []).map(e => Number(e.total_valor || 0)),
        borderColor: '#10B981',
        backgroundColor: 'rgba(16,185,129,0.08)',
        tension: 0.25,
        fill: true,
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboards</h1>

      {/* KPI Cards */}
      <section className={styles.kpiGrid}>
        <div className={styles.kpiCard}>
          <h4>Total de Ordens</h4>
          <div className={styles.kpiValue}>{totalOrdens}</div>
        </div>
        <div className={styles.kpiCard}>
          <h4>Soma Total (últimos 12 meses)</h4>
          <div className={styles.kpiValue}>R$ {somaTotal.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</div>
        </div>
        <div className={styles.kpiCard}>
          <h4>Ticket Médio</h4>
          <div className={styles.kpiValue}>R$ {isFinite(ticketMedio) ? ticketMedio.toFixed(2) : '0.00'}</div>
        </div>
        <div className={styles.kpiCard}>
          <h4>Maior Cliente (valor)</h4>
          <div className={styles.kpiValue}>{maiorCliente}</div>
        </div>
      </section>

      {/* Gráficos - no máximo 2 por linha */}
      <section className={styles.grid}>
        <div className={styles.card}>
          <h3>Total de Serviços por Tipo</h3>
          <Bar data={tipoDataset} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        <div className={styles.card}>
          <h3>Participação de Cada Cliente</h3>
          <Doughnut data={clienteDataset} options={{ responsive: true, plugins: { legend: { position: 'right' }, tooltip: { callbacks: { label: (ctx) => {
            const v = ctx.raw || 0;
            const total = (clienteShare || []).reduce((s, c) => s + Number(c.total || 0), 0);
            const pct = total ? ((v / total) * 100).toFixed(1) : '0.0';
            return `${ctx.label}: ${v} (${pct}%)`;
          } } } } }} />
        </div>

        <div className={styles.card}>
          <h3>Evolução das Cotações (valor)</h3>
          <Line data={evolDataset} options={{ responsive: true, plugins: { legend: { display: false } } }} />
        </div>

        <div className={styles.card}>
          <h3>Top 5 Clientes por Valor Total Cotado</h3>
          <Bar data={topClientesDataset} options={{ responsive: true, indexAxis: 'y', plugins: { legend: { display: false } } }} />
        </div>

        <div className={styles.card}>
          <h3>Distribuição de Status</h3>
          <Pie data={statusData} options={{ responsive: true }} />
        </div>

        <div className={styles.card}>
          <h3>Fretes - Últimos meses (contagem)</h3>
          <Line data={monthlyDataset} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          {fakeMonthly && (
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
              Exibindo dados de exemplo (sem dados reais disponíveis)
            </div>
          )}
        </div>
      </section>
    </div>
  );
}