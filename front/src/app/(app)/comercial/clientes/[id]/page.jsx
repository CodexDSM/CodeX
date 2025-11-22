"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/apiConfig";
import styles from "./detalheClientes.module.css";
import { Edit, Save, XCircle, MessageCircle } from "lucide-react";

export default function DetalheClientePage({ params }) {
  const router = useRouter();
  const [clienteId, setClienteId] = useState(null);

  useEffect(() => {
    async function fetchParams() {
      const resolved = await params;
      setClienteId(resolved?.id);
    }
    fetchParams();
  }, [params]);

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    documento: '',
    email: '',
    telefone: '',
    tipo_pessoa: '',
    ativo: true
  });

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function fetchCliente() {
      if (!clienteId) return;
      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${getApiUrl(`clientes/${clienteId}`)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          const clienteData = {
            nome: data.nome || '',
            cpf: data.cpf || '',
            documento: data.documento || '',
            email: data.email || '',
            telefone: data.telefone || '',
            tipo_pessoa: data.tipo_pessoa || '',
            ativo: data.ativo
          };
          setFormData(clienteData);
          setInitialData(clienteData);
        } else {
          console.error("Erro ao buscar cliente:", data.message);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      } finally {
        setLoading(false);
      }
    }
    fetchCliente();
  }, [clienteId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Carregando cliente...
        </div>
      </div>
    );
  }

  const handleEdit = () => setIsEditing(true);

  const handleCancel = () => {
    setIsEditing(false);
    if (initialData) {
      setFormData(initialData);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `${getApiUrl(`clientes/${clienteId}`)}`,
        {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(formData)
        }
      );
      const data = await response.json();
      if (response.ok) {
        setIsEditing(false);
        setInitialData(formData);
        alert('Cliente atualizado com sucesso!');
      } else {
        alert("Erro ao salvar: " + (data.message ?? "Verifique campos"));
      }
    } catch (err) {
      alert("Erro de rede ao salvar.");
    }
  };

  const handleInteractionClick = () => {
    router.push(`/comercial/clientes/${clienteId}/interacoes`);
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.header}>
          <div style={{
            display: "flex",
            alignItems: "center",
            gap: 16
          }}>
            <h1 className={styles.nome}>
              <span style={{ color: "#2563eb", fontWeight: 600 }}>
                Detalhes do Cliente
              </span>
            </h1>
          </div>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                  style={{
                    background: "#f1f5f9",
                    color: "#64748b",
                    border: "1px solid #e2e8f0",
                    padding: "0.5rem 1rem",
                    borderRadius: "6px",
                    fontWeight: 500,
                    fontSize: "1rem",
                    transition: "background 0.18s"
                  }}
                >
                  <XCircle size={18} /> Cancelar
                </button>
                <button
                  type="submit"
                  className={styles.saveButton}
                  style={{
                    background: "#10b981",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1.15rem",
                    borderRadius: "6px",
                    fontWeight: 500,
                    fontSize: "1rem",
                    transition: "background 0.18s"
                  }}
                >
                  <Save size={18} /> Salvar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className={styles.editButton}
                  style={{
                    background: "#2563eb",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1.12rem",
                    borderRadius: "6px",
                    fontWeight: 500,
                    fontSize: "1rem",
                    transition: "background 0.18s"
                  }}
                >
                  <Edit size={18} /> Editar
                </button>
                <button
                  type="button"
                  onClick={handleInteractionClick}
                  className={styles.interactionButton}
                  style={{
                    background: "#fbbf24",
                    color: "#fff",
                    border: "none",
                    padding: "0.5rem 1.1rem",
                    borderRadius: "6px",
                    fontWeight: 500,
                    fontSize: "1rem",
                    transition: "background 0.18s"
                  }}
                >
                  <MessageCircle size={18} /> Interações
                </button>
              </>
            )}
          </div>
        </div>

        <div className={styles.infoGrid}>
          <div className={styles.inputWrapper}>
            <label className={styles.label}>Nome Completo</label>
            <input
              name="nome"
              value={formData.nome}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
              style={{ background: "#f8fafc", borderRadius: 7 }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Tipo de Pessoa</label>
            <input
              name="tipo_pessoa"
              value={formData.tipo_pessoa === 'F' ? 'Pessoa Física' : 'Pessoa Jurídica'}
              readOnly={true}
              className={styles.input}
              style={{ background: "#f8fafc", borderRadius: 7 }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>
              {formData.tipo_pessoa === 'F' ? 'CPF' : 'CNPJ'}
            </label>
            <input
              name="documento"
              value={formData.documento}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
              style={{ background: "#f8fafc", borderRadius: 7 }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>E-mail</label>
            <input
              name="email"
              value={formData.email}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
              style={{ background: "#f8fafc", borderRadius: 7 }}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Telefone</label>
            <input
              name="telefone"
              placeholder="(00) 00000-0000"
              value={formData.telefone}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
              style={{ background: "#f8fafc", borderRadius: 7 }}
            />
          </div>
        </div>
      </form>
    </div>
  );
}
