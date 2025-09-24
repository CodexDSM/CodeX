'use client';
import { useState, useEffect, useMemo } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card"; 
import { Doughnut } from 'react-chartjs-2';
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
ChartJS.register(ArcElement, Tooltip, Legend);
import styles from './localTrabalho.module.css';

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
          // Aqui você decide: usar direto o campo `perfil`/`local_trabalho`
          // ou adaptar conforme sua tabela. Exemplo:
          const adaptado = data.map(col => ({
            id: col.id,
            nome: col.nome,
            tipo_trabalho: col.tipo_localizacao || 'presencial', // fallback
          }));
          setDados(adaptado);
        } else {
          console.error("Erro ao carregar colaboradores:", data.message);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      } finally {
        setIsLoading(false);
      }
    }

    fetchDados();
  }, []);

  const contagemTrabalho = useMemo(() => {
    const counts = {
      "home-office": 0,
      "presencial": 0,
      "evento": 0,
      "treinamento": 0,
    };

    dados.forEach((colaborador) => {
      if (colaborador.tipo_trabalho) {
        counts[colaborador.tipo_trabalho.toLowerCase()]++;
      }
    });

    return counts;
  }, [dados]);

  const chartData = {
    labels: ['Home Office', 'Presencial', 'Evento', 'Treinamento'],
    datasets: [
      {
        label: 'Funcionários por tipo de trabalho',
        data: [
          contagemTrabalho["home-office"],
          contagemTrabalho["presencial"],
          contagemTrabalho["evento"],
          contagemTrabalho["treinamento"]
        ],
        backgroundColor: ['#067ff0ff', '#004ad3ff', '#0a1fe0ff', '#0ac0e0ff'],
        hoverOffset: 4,
      },
    ],
  };

  if (isLoading) {
    return <div>Carregando relatório...</div>;
  }

  return (
    <div className={styles.painelLocalTrabalho}>
      <div className="container">
        <h1 className={styles.tituloPrincipal}>Relatório de Local de Trabalho</h1>

        <div className={styles.container}>
          <div className={styles.cardsContainer}>
            <Card className={styles.card}>
              <CardContent>
                <h2 className={styles.tituloSecao}>Home Office</h2>
                <p>{contagemTrabalho["home-office"]} Funcionários</p>
              </CardContent>
            </Card>

            <Card className={styles.card}>
              <CardContent>
                <h2 className={styles.tituloSecao}>Presencial</h2>
                <p>{contagemTrabalho["presencial"]} Funcionários</p>
              </CardContent>
            </Card>

            <Card className={styles.card}>
              <CardContent>
                <h2 className={styles.tituloSecao}>Eventos</h2>
                <p>{contagemTrabalho["evento"]} Funcionários</p>
              </CardContent>
            </Card>

            <Card className={styles.card}>
              <CardContent>
                <h2 className={styles.tituloSecao}>Treinamento</h2>
                <p>{contagemTrabalho["treinamento"]} Funcionários</p>
              </CardContent>
            </Card>
          </div>

          {/* Gráfico de Pizza */}
          <div className={styles.graficoContainer}>
            <h2 className={styles.tituloSecao}>Distribuição de Funcionários</h2>
            <Doughnut data={chartData} />
          </div>

          <Button className={styles.botaoAcao} onClick={() => location.reload()}>
            Atualizar Dados
          </Button>
        </div>
      </div>
    </div>
  );
}
