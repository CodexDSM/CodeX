'use client';
import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/apiConfig";
import { Button } from "@/components/ui/button";
import styles from "./interacoes.module.css";
import { ArrowLeft } from "lucide-react";

export default function InteracoesClientePage() {
  const router = useRouter();
  const { id: clientId } = useParams();
  const [interacoes, setInteracoes] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorHistorico, setErrorHistorico] = useState(null);
  const [clienteNome, setClienteNome] = useState("");

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
      setErrorHistorico(null);
      try {
        const token = localStorage.getItem("authToken");
        const clientResp = await fetch(
          `${getApiUrl(`clientes/${clientId}`)}`,
          { headers: { "Authorization": `Bearer ${token}` } }
        );
        if (clientResp.ok) {
          const clientData = await clientResp.json();
          setClienteNome(clientData.nome);
        }

        const response = await fetch(
          `${getApiUrl(`clients/${clientId}/interactions`)}`,
          { headers: { "Authorization": `Bearer ${token}` } }
        );
        if (!response.ok) throw new Error("Erro ao buscar interações");
        const data = await response.json();
        setInteracoes(Array.isArray(data) ? data : []);
      } catch (err) {
        setErrorHistorico("Não foi encontrado histórico de interações.");
        setInteracoes([]);
      } finally {
        setLoading(false);
      }
    };
    if (clientId) fetchInteracoes();
  }, [clientId, isSubmitting]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const token = localStorage.getItem("authToken");
      const body = {
        tipo_interacao: form.tipo_interacao,
        data_interacao: form.data_interacao,
        assunto: form.assunto,
        detalhes: form.detalhes
      };
      const response = await fetch(
        `${getApiUrl(`clients/${clientId}/interactions`)}`,
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
      alert("Erro ao salvar interação.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: 12,
          marginBottom: 20,
        }}>
          <button
            onClick={() => router.back()}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: 6,
              borderRadius: 6,
              color: '#2563eb',
              display: 'flex',
              alignItems: 'center',
            }}
            aria-label="Voltar"
          >
            <ArrowLeft size={20} />
          </button>
          <span style={{
            fontSize: '1.5rem',
            fontWeight: 500,
            color: '#222'
          }}>
            Interações <span style={{ color: "#2563eb", fontWeight: 600 }}>{clienteNome || "Cliente"}</span>
          </span>
        </div>
      </div>

      <div className={styles.layout}>
        <div className={styles.formColumn}>
          <div className={styles.formBox}>
            <span className={styles.sectionTitle}>Nova Interação</span>
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
                  placeholder="Assunto"
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
                  style={{ resize: "vertical" }}
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Data/Hora</label>
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
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className={styles.submitButton}
                  style={{
                    width: "100%",
                    background: "#2563eb",
                    color: "#fff",
                    borderRadius: 6,
                    fontWeight: 500,
                    fontSize: "1rem"
                  }}
                >
                  {isSubmitting ? "Salvando..." : "Adicionar"}
                </Button>
              </div>
            </form>
          </div>
        </div>

        <div className={styles.listColumn}>
          <div className={styles.listBox}>
            <span className={styles.sectionTitle}>Histórico de Interações</span>
            <div className={styles.listContent}>
              {loading ? (
                <div className={styles.message}>
                  <span style={{ color: '#2563eb', fontSize: '1rem' }}>Carregando...</span>
                </div>
              ) : errorHistorico ? (
                <div className={styles.message} style={{ color: '#db2626', background: "#fff7f7", borderRadius: 4, padding: 8 }}>
                  {errorHistorico}
                </div>
              ) : interacoes.length === 0 ? (
                <div className={styles.message} style={{ color: '#64748b', fontSize: '1rem' }}>
                  Nenhuma interação encontrada.
                </div>
              ) : (
                <div className={styles.list}>
                  {interacoes.map(item => (
                    <div key={item.id} className={styles.item} style={{
                      border: "1px solid #e2e8f0",
                      borderRadius: 7,
                      background: "#fff",
                      padding: "1rem",
                      marginBottom: "0.5rem",
                      boxShadow: "0 1px 4px rgba(220, 220, 220, 0.09)"
                    }}>
                      <div className={styles.itemHeader} style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        alignItems: 'center',
                        marginBottom: 7,
                        paddingBottom: 4,
                        borderBottom: "1px solid #f0f0f0"
                      }}>
                        <span className={styles.itemDate} style={{ color: '#2563eb', fontWeight: 500 }}>
                          {new Date(item.data_interacao).toLocaleDateString('pt-BR')} às {new Date(item.data_interacao).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                        </span>
                        <span className={styles.itemType} style={{
                          background: "#2563eb",
                          color: "#fff",
                          borderRadius: 10,
                          padding: "3px 13px",
                          fontSize: "0.85rem",
                          fontWeight: 500
                        }}>
                          {item.tipo_interacao}
                        </span>
                      </div>
                      <div className={styles.itemContent} style={{ marginTop: 2 }}>
                        <div className={styles.itemField} style={{ marginBottom: 2 }}>
                          <span style={{ color: "#2563eb", fontWeight: 600 }}>Assunto:</span> {item.assunto}
                        </div>
                        <div className={styles.itemField} style={{ marginBottom: 2 }}>
                          <span style={{ color: "#2563eb", fontWeight: 600 }}>Detalhes:</span> {item.detalhes}
                        </div>
                        <div className={styles.itemField} style={{ marginBottom: 2 }}>
                          <span style={{ color: "#2563eb", fontWeight: 600 }}>Por:</span> {item.nome_colaborador || item.colaborador_nome || "N/A"}
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
