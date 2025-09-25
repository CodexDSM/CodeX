'use client';
import { useState, useEffect } from "react";
import { useParams } from "next/navigation";
import { Card, CardContent } from "@/components/ui/card";
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

  // Handler universal
  const handleChange = e => {
    const { name, value } = e.target;
    setForm(prev => ({ ...prev, [name]: value }));
  };

  // Submissão conectada ao backend
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
    <div className={styles.pageContainer}>
      <h2 className={styles.pageTitle}>Interações do Cliente</h2>
      <div className={styles.row}>
        <Card className={styles.cardForm}>
          <CardContent>
            <form className={styles.form} onSubmit={handleSubmit} autoComplete="off">
              <div className={styles.formGroup}>
                <label className={styles.label}>Tipo de Interação</label>
                <select
                  name="tipo_interacao"
                  value={form.tipo_interacao}
                  onChange={handleChange}
                  required
                  className={styles.select}
                >
                  <option value="" disabled>Selecione...</option>
                  <option value="Ligação">Ligação</option>
                  <option value="E-mail">E-mail</option>
                  <option value="Reunião Presencial">Reunião Presencial</option>
                  <option value="Mensagem">Mensagem</option>
                  <option value="Outro">Outro</option>
                </select>
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Assunto</label>
                <input
                  name="assunto"
                  value={form.assunto}
                  onChange={handleChange}
                  required
                  placeholder="Digite o assunto"
                  className={styles.input}
                  autoComplete="off"
                />
              </div>
              <div className={styles.formGroup}>
                <label className={styles.label}>Detalhes</label>
                <textarea
                  name="detalhes"
                  value={form.detalhes}
                  onChange={handleChange}
                  required
                  rows={3}
                  placeholder="Descreva a interação"
                  className={styles.textarea}
                  autoComplete="off"
                />
              </div>
              <div className={styles.formGroup}>
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
              <Button variant="adicionar" type="submit" disabled={isSubmitting}>
                {isSubmitting ? "Salvando..." : "Adicionar Interação"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className={styles.listaCol}>
          <Card>
            <CardContent>
              {loading ? <p>Carregando...</p>
                : error ? <p className={styles.error}>Erro: {error}</p>
                : interacoes.length === 0 ?
                  <p>Nenhuma interação encontrada.</p>
                :
                  <ul className={styles.lista}>
                    {interacoes.map(item => (
                      <li key={item.id} className={styles.item}>
                        <b>Data:</b> {new Date(item.data_interacao).toLocaleString()}<br />
                        <b>Tipo:</b> {item.tipo_interacao}<br />
                        <b>Assunto:</b> {item.assunto}<br />
                        <b>Detalhes:</b> {item.detalhes}<br />
                        <b>Colaborador:</b> {(item.nome_colaborador || item.colaborador_nome || "N/A")}
                      </li>
                    ))}
                  </ul>
              }
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
