"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import styles from "./evento.module.css";

export default function CadastroEvento() {
  const router = useRouter();

  const initialFormData = {
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
    responsavel: "",
  };

  const [formData, setFormData] = useState(initialFormData);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  function formatDateTimeLocalToSQL(datetimeLocalStr) {
    // Recebe "2025-10-16T14:30", retorna "2025-10-16 14:30:00"
    if (!datetimeLocalStr) return null;
    return datetimeLocalStr.replace("T", " ") + ":00";
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const authToken = localStorage.getItem("authToken");

      const body = {
        ...formData,
        data_inicio: formatDateTimeLocalToSQL(formData.data_inicio),
        data_fim: formatDateTimeLocalToSQL(formData.data_fim),
      };

      const response = await fetch("http://localhost:3001/api/eventos", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${authToken}`,
        },
        body: JSON.stringify(body),
      });

      setIsLoading(false);

      if (response.ok) {
        router.push("/administrativo/eventos");
      } else {
        const err = await response.json();
        setError(err.message || "Erro ao cadastrar evento.");
      }
    } catch (error) {
      setIsLoading(false);
      setError("Erro ao enviar dados: " + error.message);
    }
  }

  return (
    <CardContent>
      <form onSubmit={handleSubmit} className={styles.form}>
        <h2 className={styles.title}>Cadastro de Evento</h2>

        {error && <p className={styles.errorMessage}>{error}</p>}

        <div className={styles.formGrid}>
          <div className={styles.inputWrapper}>
            <label className={styles.label}>Título *</label>
            <input
              name="titulo"
              placeholder="Digite o título do evento"
              value={formData.titulo}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Local *</label>
            <input
              name="local"
              placeholder="Digite o local do evento"
              value={formData.local}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Responsável</label>
            <input
              name="responsavel"
              placeholder="Nome do responsável"
              value={formData.responsavel}
              onChange={handleChange}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Data e Hora de Início *</label>
            <input
              type="datetime-local"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Data e Hora de Término *</label>
            <input
              type="datetime-local"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={`${styles.inputWrapper} ${styles.span2}`}>
            <label className={styles.label}>Descrição</label>
            <textarea
              name="descricao"
              placeholder="Descreva o evento"
              value={formData.descricao}
              onChange={handleChange}
              className={styles.input}
              rows={4}
            />
          </div>
        </div>

        <div className={styles.buttonContainer}>
          <Button type="submit" variant="adicionar" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar Evento"}
          </Button>
        </div>
      </form>
    </CardContent>
  );
}
