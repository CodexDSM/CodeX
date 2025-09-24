'use client';
import { useState, useMemo } from "react";
import { Button } from "@/components/ui/button"; // Se você estiver usando algum botão customizado
import { Card, CardContent } from "@/components/ui/card"; 
import { Doughnut } from 'react-chartjs-2'; // Para gráficos
import { Chart as ChartJS, ArcElement, Tooltip, Legend } from 'chart.js';
// Registrando os elementos do Chart.js
ChartJS.register(ArcElement, Tooltip, Legend);
import styles from './localTrabalho.module.css';  // Importando com o CSS Modules

const dadosIniciais = [
  { id: 1, nome: "Ana Beatriz", tipo_trabalho: "presencial" },
  { id: 2, nome: "Carlos Henrique", tipo_trabalho: "presencial" },
  { id: 3, nome: "Fernanda Oliveira", tipo_trabalho: "evento" },
  { id: 4, nome: "João Pedro", tipo_trabalho: "home-office" },
  { id: 5, nome: "Mariana Ribeiro", tipo_trabalho: "treinamento" },
  { id: 6, nome: "Ricardo Almeida", tipo_trabalho: "evento" },
  { id: 7, nome: "Patrícia Gomes", tipo_trabalho: "evento" },
  { id: 8, nome: "Gabriel Fernandes", tipo_trabalho: "presencial" },
  { id: 9, nome: "Luana Carvalho", tipo_trabalho: "treinamento" },
  { id: 10, nome: "Thiago Martins", tipo_trabalho: "home-office" },
];

export default function PainelLocalTrabalho() {
  const [dados] = useState(dadosIniciais);

  const contagemTrabalho = useMemo(() => {
    const counts = {
      "home-office": 0,
      "presencial": 0,
      "evento": 0,
      "treinamento": 0,
    };

    dados.forEach((colaborador) => {
      counts[colaborador.tipo_trabalho]++;
    });

    return counts;
  }, [dados]);

  const chartData = {
    labels: ['Home Office', 'Presencial', 'Evento', 'Treinamento'],
    datasets: [
      {
        label: 'Funcionários por tipo de trabalho',
        data: [contagemTrabalho["home-office"], contagemTrabalho["presencial"], contagemTrabalho["evento"], contagemTrabalho["treinamento"]],
        backgroundColor: ['#067ff0ff', '#004ad3ff', '#0a1fe0ff', '#0ac0e0ff'],
        hoverOffset: 4,
      },
    ],
  };

  return (
    <div className={styles.painelLocalTrabalho}>
      <div className="container">
        <h1 className={styles.tituloPrincipal}>Relatório de Local de Trabalho</h1>

      <div className={styles.container}>
        <div className={styles.cardsContainer}>
          <Card className={styles.card}>
            <CardContent>
              <h2 className={styles.tituloSecao}>Home Office</h2>
              <p className="contador">{contagemTrabalho["home-office"]} Funcionários</p>
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

        {/* Gráfico de Pizza (Doughnut Chart) */}
        <div className={styles.graficoContainer}>
          <h2 className={styles.tituloSecao}>Distribuição de Funcionários</h2>
          <Doughnut data={chartData} />
        </div>

        {/* Botões de Ação */}
        <Button className={styles.botaoAcao}>Atualizar Dados</Button>
        <Button className={styles.botaoAcao}>Exportar Relatório</Button>
      </div>
      </div>
    </div>
  );
}