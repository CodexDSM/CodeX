'use client';
import { useState, useEffect, useMemo } from "react";
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
import { Home, Building, Calendar, GraduationCap } from 'lucide-react';
import styles from './localTrabalho.module.css';

ChartJS.register(ArcElement, Tooltip, Legend);

export default function PainelLocalTrabalho() {
  const [dados, setDados] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function fetchDados() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch("http://localhost:3001/api/colaboradores", {
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

  if (isLoading) {
    return (
      <div className={styles.loading}>
        Carregando dados...
      </div>
    );
  }

  return (
    <div className={styles.container}>
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
    </div>
  );
}
