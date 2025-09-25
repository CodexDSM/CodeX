"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import styles from "../../../administrativo/colaboradores/[id]/detalhe.module.css";
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
  const [formData, setFormData] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function fetchCliente() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3001/api/clientes/${clienteId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setFormData(data);
          setInitialData(data);
        } else {
          console.error("Erro ao buscar cliente:", data.message);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      }
    }
    if (clienteId) {
      fetchCliente();
    }
  }, [clienteId]);

  if (!formData) {
    return <div>Carregando...</div>;
  }
  const handleEdit = () => setIsEditing(true);
  const handleCancel = () => {
    setIsEditing(false);
    setFormData(initialData);
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(
        `http://localhost:3001/api/clientes/${clienteId}`,
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
        router.refresh();
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
      <form onSubmit={handleSave}>
        <div className={styles.header}>
          <h1 className={styles.nome}>Detalhes do Cliente</h1>

          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button
                  type="button"
                  onClick={handleCancel}
                  className={styles.cancelButton}
                >
                  <XCircle size={18} /> Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  <Save size={18} /> Salvar
                </button>
              </>
            ) : (
              <>
                <button
                  type="button"
                  onClick={handleEdit}
                  className={styles.editButton}
                >
                  <Edit size={18} /> Editar
                </button>
                <button
                  type="button"
                  onClick={handleInteractionClick}
                  className={styles.interactionButton}
                >
                  <MessageCircle size={18} /> Interação
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
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>CPF</label>
            <input
              name="cpf"
              value={formData.cpf}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
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
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Tipo de pessoa</label>
            <input
              name="tipo"
              placeholder="Pessoa física"
              value={formData.tipo}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>

          <h3></h3>
          <h3 className={styles.subtitle}>Endereço</h3>
          <h3></h3>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>CEP</label>
            <input
              name="cep"
              placeholder="Digite apenas números"
              value={formData.cep}
              onChange={handleChange}
              readOnly={!isEditing}
              inputMode="numeric"
              maxLength={8}
              className={styles.input}
            />
          </div>

          <div className={`${styles.inputWrapper} ${styles.span2}`}>
            <label className={styles.label}>Logradouro</label>
            <input
              name="logradouro"
              placeholder="Rua, Avenida, etc."
              value={formData.logradouro}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Número</label>
            <input
              name="numero"
              placeholder="Número"
              value={formData.numero}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Complemento</label>
            <input
              name="complemento"
              placeholder="Apartamento, bloco, etc."
              value={formData.complemento ?? ""} 
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Bairro</label>
            <input
              name="bairro"
              placeholder="Bairro"
              value={formData.bairro}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Cidade</label>
            <input
              name="cidade"
              placeholder="Cidade"
              value={formData.cidade}
              onChange={handleChange}
              readOnly={!isEditing}
              className={styles.input}
            />
          </div>

          <div className={styles.inputWrapper}>
                <label className={styles.label}>UF</label>
                <input
                  name="UF"
                  placeholder="SP"
                  value={formData.cidade}
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
