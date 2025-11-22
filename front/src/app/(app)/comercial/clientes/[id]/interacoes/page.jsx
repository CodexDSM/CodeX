'use client';
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import styles from "./interacoes.module.css";

export default function InteracoesClientePage() {
  const { id: clientId } = useParams();
  const [interacoes, setInteracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const [form, setForm] = useState({
    tipo_interacao: '',
    assunto: '',
    detalhes: '',
    data_interacao: new Date().toISOString().slice(0, 16)
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    const fetchInteracoes = async () => {
      setLoading(true);
      setError(null);
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch(
          `http://localhost:3001/api/clients/${clientId}/interactions`,
          { headers: { "Authorization": `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Erro ao buscar interações");
        const data = await response.json();
        setInteracoes(data);
      } catch (err) {
        setError("Houve um erro ao carregar.");
      } finally {
        setLoading(false);
      }
    };
    fetchInteracoes();
  }, [clientId, isSubmitting]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    setError(null);
    try {
      const token = localStorage.getItem("authToken");
      const body = {
        tipo_interacao: form.tipo_interacao,
        data_interacao: form.data_interacao,
        assunto: form.assunto,
        detalhes: form.detalhes
      };
      const response = await fetch(
        `http://localhost:3001/api/clients/${clientId}/interactions`,
        {
          method: 'POST',
          headers: {
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json"
          },
          body: JSON.stringify(body)
        }
      );
      if (!response.ok) throw new Error("Erro ao registrar interação");
      setForm({
        tipo_interacao: '',
        assunto: '',
        detalhes: '',
        data_interacao: new Date().toISOString().slice(0, 16)
      });
    } catch (err) {
      setError("Erro ao salvar.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1 className={styles.title}>Interações do Cliente</h1>
      </div>

      <div className={styles.layout}>
        {/* FORMULÁRIO */}
        <div className={styles.formColumn}>
          <div className={styles.formBox}>
            <h2 className={styles.sectionTitle}>Nova Interação</h2>
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Tipo de Interação</label>
                <select
                  name="tipo_interacao"
                  value={form.tipo_interacao}
                  onChange={handleChange}
                  required
                  className={styles.input}
                >
                  <option value="">Selecione...</option>
                  <option value="Ligação">Ligação</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Reunião Presencial">Reunião Presencial</option>
                  <option value="Mensagem">Mensagem</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Assunto</label>
                <input
                  name="assunto"
                  value={form.assunto}
                  onChange={handleChange}
                  required
                  placeholder="Digite o assunto"
                  className={styles.input}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Detalhes</label>
                <textarea
                  name="detalhes"
                  value={form.detalhes}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Descreva a interação"
                  className={styles.textarea}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Data e Hora</label>
                <input
                  type="datetime-local"
                  name="data_interacao"
                  value={form.data_interacao}
                  onChange={handleChange}
                  required
                  className={styles.input}
                />
              </div>

              <div className={styles.buttonContainer}>
                <button 
                  type="submit" 
                  disabled={isSubmitting}
                  className={styles.submitButton}
                >
                  {isSubmitting ? "Salvando..." : "Adicionar Interação"}
                </button>
              </div>
            </form>
          </div>
        </div>

        {/* LISTA */}
        <div className={styles.listColumn}>
          <div className={styles.listBox}>
            <h2 className={styles.sectionTitle}>Histórico de Interações</h2>
            <div className={styles.listContent}>
              {loading ? (
                <div className={styles.message}>Carregando...</div>
              ) : error ? (
                <div className={styles.error}>Erro: {error}</div>
              ) : interacoes.length === 0 ? (
                <div className={styles.message}>Nenhuma interação encontrada.</div>
              ) : (
                <div className={styles.list}>
                  {interacoes.map(item => (
                    <div key={item.id} className={styles.item}>
                      <div className={styles.itemHeader}>
                        <div className={styles.itemDate}>
                          {new Date(item.data_interacao).toLocaleDateString('pt-BR')} às {new Date(item.data_interacao).toLocaleTimeString('pt-BR', {hour: '2-digit', minute: '2-digit'})}
                        </div>
                        <div className={styles.itemType}>{item.tipo_interacao}</div>
                      </div>
                      <div className={styles.itemContent}>
                        <div className={styles.itemField}>
                          <span className={styles.fieldLabel}>Assunto:</span> {item.assunto}
                        </div>
                        <div className={styles.itemField}>
                          <span className={styles.fieldLabel}>Detalhes:</span> {item.detalhes}
                        </div>
                        <div className={styles.itemField}>
                          <span className={styles.fieldLabel}>Por:</span> {item.nome_colaborador || item.colaborador_nome || "N/A"}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
