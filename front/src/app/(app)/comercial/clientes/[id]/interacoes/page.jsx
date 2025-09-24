"use client";

import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import styles from "./interacoes.module.css";

export default function InteracoesClientePage() {
  const params = useParams();
  const clienteId = params.id;

  const [interacoes, setInteracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchInteracoes = async () => {
      setLoading(true);
      setError(null);

      try {
        const token = localStorage.getItem("authToken"); // Certifique-se de que é o mesmo token do login
        if (!token) {
          throw new Error("Token não encontrado. Faça login novamente.");
        }

        const response = await fetch(
          `http://localhost:3001/api/clients/${clienteId}/interactions`,
          {
            headers: {
              "Authorization": `Bearer ${token}`,
              "Content-Type": "application/json",
            },
          }
        );

        if (!response.ok) {
          const errData = await response.json();
          throw new Error(errData.message || errData.error || "Erro ao buscar interações");
        }

        const data = await response.json();
        setInteracoes(data);
      } catch (err) {
        console.error("Erro ao buscar interações:", err);
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchInteracoes();
  }, [clienteId]);

  if (loading) return <div>Carregando interações...</div>;

  return (
    <div className={styles.container}>
      <h1>Interações do Cliente {clienteId}</h1>
      {error && <p style={{ color: "red" }}>Erro: {error}</p>}
      {!error && interacoes.length === 0 && <p>Nenhuma interação encontrada.</p>}
      {!error && interacoes.length > 0 && (
        <ul className={styles.list}>
          {interacoes.map((item) => (
            <li key={item.id} className={styles.item}>
              <p><strong>Data:</strong> {new Date(item.data_interacao).toLocaleString()}</p>
              <p><strong>Tipo:</strong> {item.tipo_interacao}</p>
              <p><strong>Assunto:</strong> {item.assunto}</p>
              <p><strong>Detalhes:</strong> {item.detalhes}</p>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
