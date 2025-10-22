"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "./detalhe.module.css";
import { Edit, Save, XCircle, Trash2 } from "lucide-react";
import React from 'react';

export default function DetalheEventoPage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const eventoId = unwrappedParams.id;

  const [colaboradores, setColaboradores] = useState([]);
  const [loadingColaboradores, setLoadingColaboradores] = useState(false);


  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    titulo: "",
    descricao: "",
    data_inicio: "",
    data_fim: "",
    local: "",
    responsavel_nome: "",
    responsavel_id: null // Adicione este campo
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
  // Função para buscar colaboradores convidados do evento
  async function fetchColaboradoresEvento() {
    if (!eventoId) return;

    setLoadingColaboradores(true);
    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(
        `http://localhost:3001/api/eventos/${eventoId}/colaboradores`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (response.ok) {
        const data = await response.json();
        setColaboradores(data);
        console.log('Colaboradores convidados:', data);
      } else {
        console.error("Erro ao buscar colaboradores");
      }
    } catch (err) {
      console.error("Erro ao buscar colaboradores:", err);
    } finally {
      setLoadingColaboradores(false);
    }
  }


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
            responsavel_nome: data.responsavel_nome || "Não atribuído",
            responsavel_id: data.responsavel_id || null
          };
          setFormData(eventoData);
          setInitialData(eventoData);
        }
        else {
          console.error("Erro ao buscar evento:", data.message || data.error);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      } finally {
        setLoading(false);
      }
    }

    fetchEvento();
    fetchColaboradoresEvento();
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

  const handleDelete = async () => {
    if (!confirm("Tem certeza que deseja deletar este evento?")) {
      return;
    }

    setLoading(true);

    try {
      const token = localStorage.getItem("authToken");
      const response = await fetch(`http://localhost:3001/api/eventos/${eventoId}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (response.ok) {
        router.replace("/administrativo/eventos");
      } else {
        setLoading(false);
        const error = await response.json();
        alert(`Erro ao deletar: ${error.message || error.error}`);
      }
    } catch (err) {
      setLoading(false);
      console.error("Erro ao deletar:", err);
      alert("Erro ao deletar evento");
    }
  };
  const handleSave = async () => {
    if (loading) return;

    try {
      const token = localStorage.getItem("authToken");
      const payload = {
        titulo: formData.titulo,
        descricao: formData.descricao,
        data_inicio: formatDateTimeLocalToSQL(formData.data_inicio),
        data_fim: formatDateTimeLocalToSQL(formData.data_fim),
        local: formData.local,
        responsavel_id: formData.responsavel_id // Adicione esta linha
      };

      const response = await fetch(`http://localhost:3001/api/eventos/${eventoId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (response.ok) {
        const updatedData = await response.json();
        setInitialData(formData);
        setIsEditing(false);
        alert("Evento atualizado com sucesso!");
      } else {
        const error = await response.json();
        alert(`Erro ao atualizar: ${error.message || error.error}`);
      }
    } catch (err) {
      console.error("Erro ao salvar:", err);
      alert("Erro ao salvar evento");
    }
  };

  return (
    <>
      <div className={styles.container}>
        <form onSubmit={handleSubmit}>
          <div className={styles.header}>
            <h1 className={styles.title}>Detalhes do Evento</h1>
            <div className={styles.headerButtons}>
              <button
                type="button"
                className={styles.deleteButton}
                onClick={handleDelete}
              >
                <Trash2 size={20} />
                Deletar
              </button>
              {isEditing ? (
                <>
                  <button
                    type="button"
                    className={styles.cancelButton}
                    onClick={handleCancelClick}
                  >
                    <XCircle size={20} />
                    Cancelar
                  </button>
                  <button type="submit" className={styles.saveButton}>
                    <Save size={20} />
                    Salvar
                  </button>
                </>
              ) : (
                <button
                  type="button"
                  className={styles.editButton}
                  onClick={handleEditClick}
                >
                  <Edit size={20} />
                  Editar
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

            <div className={styles.inputWrapper}>
              <label className={styles.label}>Responsável</label>
              <input
                name="responsavel_nome"
                value={formData.responsavel_nome}
                onChange={handleChange}
                readOnly={!isEditing}
                className={styles.input}
                placeholder="Nome do responsável pelo evento"
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
            </div>

            {/* Seção de Feedbacks do Evento */}
            <div className={styles.sectionStatus}>

            {/* Seção de Colaboradores Convidados */}
            <div className={styles.sectionStatusConvidados}>
              <h3 className={styles.sectionTitle}>Colaboradores Convidados</h3>

              {loadingColaboradores ? (
                <p>Carregando colaboradores...</p>
              ) : colaboradores.length === 0 ? (
                <p style={{ color: '#666', fontStyle: 'italic' }}>
                  Nenhum colaborador foi convidado para este evento.
                </p>
              ) : (
                <div className={styles.colaboradoresList}>
                  {colaboradores.map((colab) => (
                    <div
                      key={colab.colaborador_id}
                      className={styles.colaboradorCard}
                      style={{
                        borderLeft: `4px solid ${colab.status === 'Aceito' ? '#4CAF50' :
                          colab.status === 'Recusado' ? '#f44336' :
                            '#FFA726'
                          }`
                      }}
                    >
                      <div className={styles.colaboradorHeader}>
                        <h4 className={styles.colaboradorNome}>{colab.nome}</h4>
                        <span
                          className={styles.statusBadge}
                          style={{
                            backgroundColor:
                              colab.status === 'Aceito' ? '#4CAF50' :
                                colab.status === 'Recusado' ? '#f44336' :
                                  '#FFA726',
                            color: 'white',
                            padding: '4px 12px',
                            borderRadius: '12px',
                            fontSize: '12px',
                            fontWeight: 'bold'
                          }}
                        >
                          {colab.status}
                        </span>
                      </div>

                      <p className={styles.colaboradorEmail}>{colab.email}</p>

                      {/* Mostrar data de resposta se houver */}
                      {colab.respondido_em && (
                        <p className={styles.colaboradorResposta}>
                          Respondido em: {new Date(colab.respondido_em).toLocaleString('pt-BR')}
                        </p>
                      )}

                      {/* Mostrar motivo de recusa se houver */}
                      {colab.status === 'Recusado' && colab.justificativa_recusa && (
                        <div className={styles.justificativaBox}>
                          <strong>Motivo da recusa:</strong>
                          <p>{colab.justificativa_recusa}</p>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
              
            
            {/* Seção de Feedbacks do Evento */}
            <div className={styles.sectionStatusFB} style={{  }}>
              <h3 className={styles.sectionTitle}>Feedbacks do Evento</h3>

              {loadingColaboradores ? (
                <p>Carregando feedbacks...</p>
              ) : (() => {
                // Filtrar apenas colaboradores que enviaram feedback
                const colaboradoresComFeedback = colaboradores.filter(
                  colab => colab.feedback && colab.feedback.trim() !== ''
                );

                if (colaboradoresComFeedback.length === 0) {
                  return (
                    <p style={{ color: '#666', fontStyle: 'italic' }}>
                      Nenhum feedback foi enviado para este evento ainda.
                    </p>
                  );
                }

                return (
                  <div className={styles.feedbackList}>
                    {colaboradoresComFeedback.map((colab) => (
                      <div key={colab.colaborador_id} className={styles.feedbackCard}>
                        <div className={styles.feedbackHeader}>
                          <div>
                            <h4 className={styles.feedbackNome}>{colab.nome}</h4>
                            <p className={styles.feedbackEmail}>{colab.email}</p>
                          </div>

                          {/* Mostrar se concluiu o evento */}
                          {colab.concluido && (
                            <span
                              className={styles.badgeConcluido}
                              style={{
                                backgroundColor: '#4CAF50',
                                color: 'white',
                                padding: '4px 12px',
                                borderRadius: '12px',
                                fontSize: '12px',
                                fontWeight: 'bold'
                              }}
                            >
                              ✓ Concluído
                            </span>
                          )}
                        </div>

                        {/* Feedback */}
                        <div className={styles.feedbackContent}>
                          <p>{colab.feedback}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                );
              })()}
            </div>
            
            </div>

          
        </form>
      </div>
    </>
  );
}