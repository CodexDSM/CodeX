"use client";

import React, { useEffect, useState } from 'react';
import { getApiUrl, getAuthHeaders } from '@/lib/apiConfig';
import { Chart as ChartJS, CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend } from 'chart.js';
import { Line, Bar, Pie } from 'react-chartjs-2';
import styles from './dashboards.module.css';

ChartJS.register(CategoryScale, LinearScale, PointElement, LineElement, BarElement, ArcElement, Tooltip, Legend);

export default function DashboardsPage() {
  const [summary, setSummary] = useState(null);
  const [monthly, setMonthly] = useState([]);
  const [topClientes, setTopClientes] = useState([]);
  const [fakeMonthly, setFakeMonthly] = useState(false);

  useEffect(() => {
    fetchSummary();
    fetchMonthly();
    fetchTopClientes();
  }, []);

  async function fetchSummary() {
    try {
      const res = await fetch(getApiUrl('dashboard/summary'), { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.status === 401 || res.status === 403) return;
      if (json.success) setSummary(json.data);
    } catch (err) {
      console.error('Erro summary', err);
    }
  }

  async function fetchMonthly() {
    try {
      const res = await fetch(getApiUrl('dashboard/monthly-fretes'), { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.status === 401 || res.status === 403) {
        const fallback = generateFakeMonthly(6);
        setMonthly(fallback);
        setFakeMonthly(true);
        return;
      }
      if (json.success && Array.isArray(json.data) && json.data.length > 0) {
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

  async function fetchTopClientes() {
    try {
      const res = await fetch(getApiUrl('dashboard/top-clientes'), { headers: getAuthHeaders() });
      const json = await res.json();
      if (res.status === 401 || res.status === 403) return;
      if (json.success) setTopClientes(json.data);
    } catch (err) {
      console.error('Erro top clientes', err);
    }
  }

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

  const statusData = {
    labels: summary ? Object.keys(summary.status_counts) : [],
    datasets: [
      {
        data: summary ? Object.values(summary.status_counts) : [],
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

  const topClientesDataset = {
    labels: topClientes.map(t => t.nome),
    datasets: [
      {
        label: 'Faturamento (R$)',
        data: topClientes.map(t => Number(t.total || 0)),
        backgroundColor: '#06B6D4',
      },
    ],
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Dashboards</h1>

      <section className={styles.grid}>
        <div className={styles.card}>
          <h3>Distribuição de Status</h3>
          <Pie data={statusData} options={{ responsive: true }} />
        </div>

        <div className={styles.card}>
          <h3>Fretes - Últimos meses</h3>
          <Line data={monthlyDataset} options={{ responsive: true, plugins: { legend: { display: false } } }} />
          {fakeMonthly && (
            <div style={{ marginTop: 8, color: '#6b7280', fontSize: 13 }}>
              Exibindo dados de exemplo (sem dados reais disponíveis)
            </div>
          )}
        </div>

        <div className={styles.cardFull}>
          <h3>Top Clientes por Faturamento</h3>
          <Bar data={topClientesDataset} options={{ responsive: true }} />
        </div>
      </section>
    </div>
  );
}
