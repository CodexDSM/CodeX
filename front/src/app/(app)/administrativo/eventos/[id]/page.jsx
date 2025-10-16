"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhe.module.css";
import { Edit, Save, XCircle } from "lucide-react";

export default function DetalheEventoPage({ params }) {
  const router = useRouter();
  const eventoId = params?.id;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
  });

  const [initialData, setInitialData] = useState(null);

  // Função para converter formato do backend para datetime-local
  const formatDateToDateTimeLocal = (dateTimeStr) => {
    if (!dateTimeStr) return "";
    // Exemplo: "2025-10-16 14:30:00" => "2025-10-16T14:30"
    return dateTimeStr.replace(" ", "T").slice(0, 16);
  };

  // Função para converter datetime-local para formato SQL com segundos
  const formatDateTimeLocalToSQL = (datetimeLocalStr) => {
    if (!datetimeLocalStr) return null;
    // Exemplo: "2025-10-16T14:30" => "2025-10-16 14:30:00"
    return datetimeLocalStr.replace("T", " ") + ":00";
  };

  useEffect(() => {
    async function fetchEvento() {
      if (!eventoId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(`http://localhost:3001/api/eventos/${eventoId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const data = await response.json();

        if (response.ok) {
          const eventoData = {
            titulo: data.titulo || "",
            descricao: data.descricao || "",
            data_inicio: formatDateToDateTimeLocal(data.data_inicio),
            data_fim: formatDateToDateTimeLocal(data.data_fim),
            local: data.local || "",
          };
          setFormData(eventoData);
          setInitialData(eventoData);
        } else {
          console.error("Erro ao buscar evento:", data.message || data.error);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvento();
  }, [eventoId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: "center", padding: "2rem", color: "#64748b" }}>
          Carregando evento...
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleEditClick = () => setIsEditing(true);

  const handleCancelClick = () => {
    if (initialData) setFormData(initialData);
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");

      const body = {
        ...formData,
        data_inicio: formatDateTimeLocalToSQL(formData.data_inicio),
        data_fim: formatDateTimeLocalToSQL(formData.data_fim),
      };

      const response = await fetch(`http://localhost:3001/api/eventos/${eventoId}`, {
        method: "PUT",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(body),
      });

      const data = await response.json();
      if (response.ok) {
        setIsEditing(false);
        setInitialData(formData);
        alert("Evento atualizado com sucesso!");
      } else {
        alert("Erro ao salvar: " + (data.message || data.error));
      }
    } catch (err) {
      alert("Erro de rede ao salvar evento.");
    }
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1 className={styles.nome}>Detalhes do Evento</h1>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancelClick}
                  className={styles.cancelButton}
                >
                  <XCircle size={18} /> Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  <Save size={18} /> Salvar
                </button>
              </>
            ) : (
              <button
                type="button"
                onClick={handleEditClick}
                className={styles.editButton}
              >
                <Edit size={18} /> Editar
              </button>
            )}
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.inputWrapper}>
            <label className={styles.label}>Título</label>
            <input
              name="titulo"
              value={formData.titulo}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
              required
            />
          </div>

          <div className={`${styles.inputWrapper} ${styles.span2}`}>
            <label className={styles.label}>Descrição</label>
            <textarea
              name="descricao"
              value={formData.descricao}
              onChange={handleChange}
              readOnly={!isEditing}
              rows={3}
              className={styles.input}
              style={{ resize: "vertical" }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Data e Hora de Início</label>
            <input
              type="datetime-local"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
              required
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Data e Hora de Fim</label>
            <input
              type="datetime-local"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Local</label>
            <input
              name="local"
              value={formData.local}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
