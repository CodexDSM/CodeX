"use client";
import { useState, useEffect } from 'react';
import { useRouter, useParams } from 'next/navigation';
import { getApiUrl } from '@/lib/apiConfig';
import styles from './detalhe.module.css';
import { Edit, Save, XCircle } from 'lucide-react';
import React from 'react';

export default function DetalheColaboradorPage({ params }) {
  const router = useRouter();
  const unwrappedParams = React.use(params);
  const colaboradorId = unwrappedParams.id;

  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(true);

  const [formData, setFormData] = useState({
    nome: '',
    cpf: '',
    email: '',
    telefone: '',
    perfil: '',
    ativo: true,
    tipo_localizacao: '',
    cep: '',
    logradouro: '',
    numero: '',
    complemento: '',
    bairro: '',
    cidade: '',
    uf: ''
  });

  const [initialData, setInitialData] = useState(null);

  useEffect(() => {
    async function fetchColaborador() {
      if (!colaboradorId) return;

      setLoading(true);
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(`${getApiUrl(`colaboradores/${colaboradorId}`)}`, {
          headers: {
            'Authorization': `Bearer ${token}`,
          },
        });

        const data = await response.json();

        if (response.ok) {
          const colaboradorData = {
            nome: data.nome || '',
            cpf: data.cpf || '',
            email: data.email || '',
            telefone: data.telefone || '',
            perfil: data.perfil || '',
            ativo: data.ativo,
            tipo_localizacao: data.tipo_localizacao || '',
            cep: data.cep || '',
            logradouro: data.logradouro || '',
            numero: data.numero || '',
            complemento: data.complemento || '',
            bairro: data.bairro || '',
            cidade: data.cidade || '',
            uf: data.uf || ''
          };

          setFormData(colaboradorData);
          setInitialData(colaboradorData);
        }
      } catch (err) {
        // erro silencioso
      } finally {
        setLoading(false);
      }
    }

    fetchColaborador();
  }, [colaboradorId]);

  if (loading) {
    return (
      <div className={styles.container}>
        <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>
          Carregando colaborador...
        </div>
      </div>
    );
  }

  const handleChange = (e) => {
    const { name, value } = e.target;
    let processedValue = value;

    if (name === 'ativo') {
      processedValue = value === 'true';
    }

    setFormData(prev => ({ ...prev, [name]: processedValue }));
  };

  const handleEditClick = () => {
    setIsEditing(true);
  };

  const handleCancelClick = () => {
    if (initialData) {
      setFormData(initialData);
    }
    setIsEditing(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem('authToken');

      if (formData.tipo_localizacao && formData.tipo_localizacao !== initialData.tipo_localizacao) {
        try {
          await fetch(`${getApiUrl('localizacoes')}`, {
            method: 'POST',
            headers: {
              'Authorization': `Bearer ${token}`,
              'Content-Type': 'application/json'
            },
            body: JSON.stringify({
              colaborador_id: colaboradorId,
              tipo_localizacao: formData.tipo_localizacao
            })
          });
        } catch {}
      }

      const response = await fetch(`${getApiUrl(`colaboradores/${colaboradorId}`)}`, {
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
    } catch {
      alert("Erro de rede ao salvar colaborador.");
    }
  };

  const formatTipoLocalizacao = (tipo) => {
    if (!tipo) return 'Não definido';
    const tipos = {
      'Presencial': 'Presencial',
      'Home Office': 'Home Office',
      'Evento': 'Evento',
      'Treinamento': 'Treinamento'
    };
    return tipos[tipo] || tipo.replace(/_/g, ' ');
  };

  return (
    <div className={styles.container}>
      <form onSubmit={handleSubmit}>
        <div className={styles.header}>
          <h1 className={styles.nome}>Detalhes do Colaborador</h1>
          <div className={styles.actionButtons}>
            {isEditing ? (
              <>
                <button type="button" onClick={handleCancelClick} className={styles.cancelButton}>
                  <XCircle size={18} /> Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  <Save size={18} /> Salvar
                </button>
              </>
            ) : (
              <button type="button" onClick={handleEditClick} className={styles.editButton}>
                <Edit size={18} /> Editar
              </button>
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
            <label className={styles.label}>Perfil</label>
            {isEditing ? (
              <select
                name="perfil"
                value={formData.perfil}
                onChange={handleChange}
                className={styles.input}
                required
              >
                <option value="">Selecione...</option>
                <option value="Administrador">Administrador</option>
                <option value="Gerente">Gerente</option>
                <option value="Operador">Operador</option>
                <option value="Comercial">Comercial</option>
              </select>
            ) : (
              <input
                value={formData.perfil}
                readOnly
                className={styles.input}
              />
            )}
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Status</label>
            {isEditing ? (
              <select
                name="ativo"
                value={formData.ativo}
                onChange={handleChange}
                className={styles.input}
              >
                <option value={true}>Ativo</option>
                <option value={false}>Inativo</option>
              </select>
            ) : (
              <input
                value={formData.ativo ? 'Ativo' : 'Inativo'}
                readOnly
                className={`${styles.input} ${styles.statusInput}`}
                data-status={formData.ativo}
              />
            )}
          </div>

          <div className={styles.inputWrapper}>
            <label className={styles.label}>Localização Atual</label>
            {isEditing ? (
              <select
                name="tipo_localizacao"
                value={formData.tipo_localizacao}
                onChange={handleChange}
                className={styles.input}
                style={{ position: 'static', zIndex: 1 }}
              >
                <option value="">Selecione...</option>
                <option value="Presencial">Presencial</option>
                <option value="Home Office">Home Office</option>
                <option value="Evento">Evento</option>
                <option value="Treinamento">Treinamento</option>
              </select>
            ) : (
              <input
                value={formatTipoLocalizacao(formData.tipo_localizacao)}
                readOnly
                className={styles.input}
              />
            )}
          </div>
        </div>
      </form>
    </div>
  );
}
