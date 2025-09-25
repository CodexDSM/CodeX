"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import styles from './detalhe.module.css';
import { Edit, Save, XCircle } from 'lucide-react';
import React from 'react';
import { Header } from '@/components/layout/header'; // ajuste o caminho conforme seu projeto




export default function DetalheColaboradorPage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const colaboradorId   = unwrappedParams.id;
    
  const [isEditing, setIsEditing] = useState(false);

  const [formData, setFormData] = useState(null);
  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function fetchColaborador() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`http://localhost:3001/api/colaboradores/${colaboradorId}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });
  
        const data = await response.json();
  
        if (response.ok) {
          setFormData(data);
          setInitialData(data);
        } else {
          console.error("Erro ao buscar colaborador:", data.message);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      }
    }
  
    if (colaboradorId) {
      fetchColaborador();
    }
  }, [colaboradorId]);
  

  // Se os dados ainda não carregaram, mostre uma mensagem
    if (!formData) {
      return <div>Carregando...</div>;
    }

  const handleChange = (e) => {
  const { name, value } = e.target;
  setFormData(prev => ({ ...prev, [name]: value }));
};

const handleEditClick = () => {
  setIsEditing(true); // Libera os campos para edição
};

const handleCancelClick = () => {
  setFormData(initialData); // Restaura os dados originais
  setIsEditing(false); // Trava os campos novamente
};


const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/colaboradores/${colaboradorId}`, {
        method: "PUT",
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': "application/json",
        },
        body: JSON.stringify(formData),
      });
      const data = await response.json();
      if (response.ok) {
        setIsEditing(false);
        setInitialData(formData);
        alert("Colaborador atualizado com sucesso!");
      } else {
        alert("Erro ao salvar: " + data.message);
      }
    } catch (err) {
      alert("Erro de rede ao salvar colaborador.");
    }
  };

<Header customTitle={formData.nome} />
return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
      <div className={styles.header}>
        <h1 className={styles.nome}>Detalhes do Colaborador</h1>
        
        {/* LÓGICA DOS BOTÕES */}
        {isEditing ? (
          <div className={styles.actionButtons}>
            <button type="button" onClick={handleCancelClick} className={styles.cancelButton}>
              <XCircle size={18} /> Cancelar
            </button>
            <button type="submit" className={styles.saveButton}>
              <Save size={18} /> Salvar
            </button>
          </div>
        ) : (
          <button type="button" onClick={handleEditClick} className={styles.editButton}>
            <Edit size={18} /> Editar
          </button>
        )}
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
            name="CPF"
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
          <label className={styles.label}>Senha</label>
          <input
            name="senha"
            type='password'
            value={formData.senha ?? ""}
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
            <label className={styles.label}>Perfil</label>
              <input
                name="Perfil"
                placeholder="Administrador"
                value={formData.perfil}
                onChange={handleChange}
                readOnly={!isEditing}
                className={styles.input}
              />
        </div>  

        <h3 className={styles.subtitle}>Endereço</h3>
        <h3></h3>
              <div className={styles.inputWrapper}>
                <label className={styles.label}>CEP </label>
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
                <label className={styles.label}>Logradouro </label>
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
                <label className={styles.label}>Número </label>
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
)

}