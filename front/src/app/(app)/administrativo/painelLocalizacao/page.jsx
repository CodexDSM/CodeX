'use client';
import { useState, useEffect, useMemo } from "react";
import { getApiUrl, getAuthHeaders } from "@/lib/apiConfig";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Home, Building, Calendar, GraduationCap } from 'lucide-react';
import styles from './localTrabalho.module.css';
import exportStyles from '../../dashboard/dashboards.module.css';
import faturamentosStyles from '../../faturamentos/faturamentos.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PainelLocalTrabalho() {
  const [dados, setDados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [exportLoading, setExportLoading] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);
  const [exportError, setExportError] = useState('');
  const [pdfError, setPdfError] = useState('');

  useEffect(() => {
    async function fetchDados() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(getApiUrl("colaboradores"), {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          const adaptado = data.map(col => ({
            id: col.id,
            nome: col.nome,
            tipo_trabalho: col.tipo_localizacao,
          }));
          setDados(adaptado);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDados();
    const interval = setInterval(fetchDados, 30000);
    return () => clearInterval(interval);
  }, []);

  const contagemTrabalho = useMemo(() => {
    const counts = { "home office": 0, "presencial": 0, "evento": 0, "treinamento": 0 };
    dados.forEach((colaborador) => {
      if (colaborador.tipo_trabalho) {
        let valor = colaborador.tipo_trabalho
          .replace(/_|-/g, ' ')
          .replace(/([a-z])([A-Z])/g, '$1 $2')
          .toLowerCase()
          .trim();
        if (counts[valor] !== undefined) {
          counts[valor]++;
        }
      }
    });
    return counts;
  }, [dados]);

  const totalColaboradores = dados.length;

  const chartData = {
    labels: ['Home Office', 'Presencial', 'Eventos', 'Treinamento'],
    datasets: [
      {
        data: [
          contagemTrabalho["home office"],
          contagemTrabalho["presencial"],
          contagemTrabalho["evento"],
          contagemTrabalho["treinamento"]
        ],
        backgroundColor: ['#06b6d4', '#3b82f6', '#8b5cf6', '#10b981'],
        borderWidth: 0,
        hoverOffset: 0,
        cutout: '55%',
      },
    ],
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    layout: {
      padding: 0
    },
    plugins: {
      legend: {
        display: false
      },
      tooltip: {
        enabled: true,
        external: false,
        callbacks: {
          label: function(context) {
            return `${context.label}: ${context.parsed}`;
          }
        }
      }
    }
  };

  // --- Export helpers (reused from dashboard) ---
  function downloadBlob(filename, content, mime = 'text/csv;charset=utf-8;') {
    const bom = new Uint8Array([0xEF, 0xBB, 0xBF]);
    const blob = new Blob([bom, content], { type: mime });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
  }

  function buildCsvLocal() {
    const lines = [];
    lines.push(['Relatório: Localização']);
    lines.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
    lines.push([]);
    lines.push(['Resumo']);
    lines.push(['Total Colaboradores', totalColaboradores]);
    lines.push(['Home Office', contagemTrabalho['home office']]);
    lines.push(['Presencial', contagemTrabalho['presencial']]);
    lines.push(['Eventos', contagemTrabalho['evento']]);
    lines.push(['Treinamento', contagemTrabalho['treinamento']]);
    lines.push([]);
    lines.push(['ID', 'Nome', 'Tipo de Localização']);
    dados.forEach(d => lines.push([d.id, d.nome, d.tipo_trabalho]));
    return lines.map(r => r.map(c => {
      if (c == null) return '';
      const s = String(c).replace(/"/g, '""');
      if (s.includes(',') || s.includes('\n') || s.includes('"')) return `"${s}"`;
      return s;
    }).join(',')).join('\r\n');
  }

  const handleExportCSVLocal = async () => {
    setExportError('');
    setExportLoading(true);
    try {
      // Enrich dados with last 30 days login history per collaborator
      const enriched = await Promise.all(dados.map(async (d) => {
        const logins = await fetchLoginHistoryForColaborador(d.id);
        return { ...d, lastLogins30d: logins };
      }));

      // Build CSV using enriched data
      const lines = [];
      lines.push(['Relatório: Localização']);
      lines.push([`Gerado em: ${new Date().toLocaleString('pt-BR')}`]);
      lines.push([]);
      lines.push(['Resumo']);
      lines.push(['Total Colaboradores', totalColaboradores]);
      lines.push(['Home Office', contagemTrabalho['home office']]);
      lines.push(['Presencial', contagemTrabalho['presencial']]);
      lines.push(['Eventos', contagemTrabalho['evento']]);
      lines.push(['Treinamento', contagemTrabalho['treinamento']]);
      lines.push([]);
      lines.push(['ID', 'Nome', 'Tipo de Localização', 'Logins 30d (count)', 'Logins 30d (detalhe)']);
      enriched.forEach(d => {
        const count = Array.isArray(d.lastLogins30d) ? d.lastLogins30d.length : 0;
        const detalhe = (d.lastLogins30d || []).map(ts => {
          try { return new Date(ts).toLocaleString('pt-BR'); } catch (e) { return String(ts); }
        }).join(' | ');
        lines.push([d.id, d.nome, d.tipo_trabalho, count, detalhe]);
      });

      const csv = lines.map(r => r.map(c => {
        if (c == null) return '';
        const s = String(c).replace(/"/g, '""');
        // use semicolon as separator for Excel compatibility
        if (s.includes(';') || s.includes('\n') || s.includes('"')) return `"${s}"`;
        return s;
      }).join(';')).join('\r\n');
      const now = new Date();
      const stamp = now.toISOString().slice(0,19).replace(/[:T]/g, '-');
      downloadBlob(`localizacoes-${stamp}.csv`, csv, 'text/csv;charset=utf-8;');
    } catch (e) {
      console.error('Erro ao exportar CSV local', e);
      setExportError('Erro ao exportar CSV');
    } finally {
      setExportLoading(false);
    }
  };

  async function fetchLoginHistoryForColaborador(colaboradorId) {
    const headers = { ...getAuthHeaders() };
    const endpoints = [
      // Try several possible API shapes
      getApiUrl(`colaboradores/${colaboradorId}/logins?days=30`),
      getApiUrl(`colaboradores/${colaboradorId}/logins`),
      getApiUrl(`logins?colaborador_id=${colaboradorId}&days=30`),
      getApiUrl(`logins?colaboradorId=${colaboradorId}&days=30`),
      getApiUrl(`colaboradores/logins?colaboradorId=${colaboradorId}&days=30`),
    ];

    for (const ep of endpoints) {
      try {
        const res = await fetch(ep, { headers });
        if (!res.ok) continue;
        const json = await res.json();
        // Accept either array of timestamps or { data: [...] }
        if (Array.isArray(json)) return json;
        if (json && Array.isArray(json.data)) return json.data;
        // If returns object with rows
        if (json && Array.isArray(json.rows)) return json.rows.map(r => r.timestamp || r.created_at || r.login_time || r.date);
        // Otherwise skip to next
      } catch (e) {
        // continue trying other endpoints
      }
    }
    return [];
  }

  function buildPrintableHtmlFromDashboard(payload) {
    const escape = s => String(s == null ? '' : s).replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;');
    let html = `<!doctype html><html><head><meta charset="utf-8"><title>Relatório de Localização</title>`;
    html += `<style>body{font-family:Arial,Helvetica,sans-serif;padding:20px;color:#111}table{border-collapse:collapse;width:100%;margin-bottom:18px}th,td{border:1px solid #ddd;padding:8px;text-align:left}h2{margin-top:18px}</style>`;
    html += `</head><body>`;
    html += `<h1>Relatório de Localização</h1>`;

    // summary
    html += `<h2>Resumo</h2><table><tbody>`;
    const summary = payload.summary || {};
    for (const k of Object.keys(summary)) html += `<tr><th>${escape(k)}</th><td>${escape(summary[k])}</td></tr>`;
    html += `</tbody></table>`;

    // colaboradores table if present
    const colaboradores = payload.colaboradores || [];
    if (colaboradores.length > 0) {
      html += `<h2>Colaboradores</h2><table><thead><tr><th>ID</th><th>Nome</th><th>Tipo de Localização</th></tr></thead><tbody>`;
      colaboradores.forEach(c => {
        html += `<tr><td>${escape(c.id)}</td><td>${escape(c.nome)}</td><td>${escape(c.tipo_trabalho)}</td></tr>`;
      });
      html += `</tbody></table>`;
    }

    html += `<script>window.onload=function(){setTimeout(()=>{try{window.print()}catch(e){console.error(e)}},300)}</script>`;
    html += `</body></html>`;
    return html;
  }

  async function handleExportPDFLocal() {
    setPdfError('');
    setPdfLoading(true);
    try {
      // Try server-side PDF export (same approach as faturamentos)
      const endpoints = [
        getApiUrl('/localizacoes/relatorio'),
        getApiUrl('/colaboradores/relatorio'),
      ];
      let succeeded = false;
      for (const ep of endpoints) {
        try {
          const res = await fetch(ep, {
            method: 'POST',
            headers: { ...getAuthHeaders(), 'Content-Type': 'application/json' },
            body: JSON.stringify({ format: 'pdf' }),
          });
          if (!res.ok) continue;
          const blob = await res.blob();
          const url = window.URL.createObjectURL(blob);
          const a = document.createElement('a');
          const now = new Date();
          const timestamp = `${now.getFullYear()}-${String(now.getMonth()+1).padStart(2,'0')}-${String(now.getDate()).padStart(2,'0')}_${String(now.getHours()).padStart(2,'0')}${String(now.getMinutes()).padStart(2,'0')}`;
          a.href = url;
          a.download = `localizacoes_${timestamp}.pdf`;
          document.body.appendChild(a);
          a.click();
          a.remove();
          window.URL.revokeObjectURL(url);
          succeeded = true;
          break;
        } catch (e) {
          // try next endpoint
        }
      }

      if (!succeeded) {
        setPdfError('Erro ao exportar PDF: servidor não retornou o arquivo.');
      }
    } catch (e) {
      console.error('Erro ao exportar PDF local', e);
      setPdfError('Erro ao exportar PDF');
    } finally {
      setPdfLoading(false);
    }
  }

  if (isLoading) {
    return (
      <div className={styles.loading}>
        Carregando dados...
      </div>
    );
  }

  return (
    <>
      <div style={{display: 'flex', justifyContent: 'flex-end', marginBottom: 12}}>
        <div>
          <button
            className={faturamentosStyles.buttonGhost}
            onClick={handleExportCSVLocal}
            disabled={exportLoading}
            aria-label="Exportar Excel"
          >
            {exportLoading ? 'Exportando...' : 'Exportar Excel'}
          </button>

          <button
            className={faturamentosStyles.buttonGhost}
            onClick={handleExportPDFLocal}
            disabled={pdfLoading}
            aria-label="Exportar PDF"
            style={{marginLeft: 8}}
          >
            {pdfLoading ? 'Gerando PDF...' : 'Exportar PDF'}
          </button>

          {exportError && <div className={faturamentosStyles.errorBox} style={{marginTop:8}}>{exportError}</div>}
          {pdfError && <div className={faturamentosStyles.errorBox} style={{marginTop:8}}>{pdfError}</div>}
        </div>
      </div>

      <div className={styles.content}>
        <div className={styles.chartSection}>
          <div className={styles.chartWrapper}>
            <div className={styles.chartContainer}>
              <Doughnut data={chartData} options={chartOptions} />
              <div className={styles.centerLabel}>
                <span className={styles.centerNumber}>{totalColaboradores}</span>
              </div>
            </div>
          </div>

          <div className={styles.legend}>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{backgroundColor: '#06b6d4'}}></span>
              <span>Home Office</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{backgroundColor: '#3b82f6'}}></span>
              <span>Presencial</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{backgroundColor: '#8b5cf6'}}></span>
              <span>Eventos</span>
            </div>
            <div className={styles.legendItem}>
              <span className={styles.legendColor} style={{backgroundColor: '#10b981'}}></span>
              <span>Treinamento</span>
            </div>
          </div>
        </div>

        <div className={styles.statsGrid}>
          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#06b6d4'}}>
              <Home size={20} />
            </div>
            <div className={styles.statContent}>
              <h3>Home Office</h3>
              <span className={styles.statNumber}>{contagemTrabalho["home office"]}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#3b82f6'}}>
              <Building size={20} />
            </div>
            <div className={styles.statContent}>
              <h3>Presencial</h3>
              <span className={styles.statNumber}>{contagemTrabalho["presencial"]}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#8b5cf6'}}>
              <Calendar size={20} />
            </div>
            <div className={styles.statContent}>
              <h3>Eventos</h3>
              <span className={styles.statNumber}>{contagemTrabalho["evento"]}</span>
            </div>
          </div>

          <div className={styles.statCard}>
            <div className={styles.statIcon} style={{backgroundColor: '#10b981'}}>
              <GraduationCap size={20} />
            </div>
            <div className={styles.statContent}>
              <h3>Treinamento</h3>
              <span className={styles.statNumber}>{contagemTrabalho["treinamento"]}</span>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
  
