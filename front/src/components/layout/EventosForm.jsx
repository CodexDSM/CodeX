'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/apiConfig';
import styles from './evento.module.css';

export default function CadastroEvento() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [colaboradores, setColaboradores] = useState([]);
  const [colaboradoresSelecionados, setColaboradoresSelecionados] = useState([]);

  const [formData, setFormData] = useState({
    titulo: '',
    descricao: '',
    data_inicio: '',
    data_fim: '',
    local: '',
    responsavel_id: ''
  });

  // Busca lista de colaboradores
  useEffect(() => {
    async function fetchColaboradores() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch(getApiUrl('colaboradores'), {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await response.json();
        if (response.ok) {
          setColaboradores(data);
        }
      } catch (err) {
        console.error('Erro ao buscar colaboradores:', err);
      }
    }
    fetchColaboradores();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleColaboradorToggle = (colaboradorId) => {
    setColaboradoresSelecionados(prev => {
      if (prev.includes(colaboradorId)) {
        return prev.filter(id => id !== colaboradorId);
      } else {
        return [...prev, colaboradorId];
      }
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const token = localStorage.getItem('authToken');
      const payload = {
        ...formData,
        colaboradores_ids: colaboradoresSelecionados
      };

      const response = await fetch(getApiUrl('eventos'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        alert('Evento criado com sucesso!');
        router.push('/administrativo/eventos');
      } else {
        const error = await response.json();
        alert(`Erro: ${error.error || 'Erro ao criar evento'}`);
      }
    } catch (err) {
      console.error('Erro:', err);
      alert('Erro ao criar evento');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      <h1 className={styles.title}>Criar Novo Evento</h1>

      <form onSubmit={handleSubmit} className={styles.form}>
        <div className={styles.formGroup}>
          <label>Título *</label>
          <input
            type="text"
            name="titulo"
            value={formData.titulo}
            onChange={handleChange}
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Descrição</label>
          <textarea
            name="descricao"
            value={formData.descricao}
            onChange={handleChange}
            className={styles.textarea}
            rows="4"
          />
        </div>

        <div className={styles.formRow}>
          <div className={styles.formGroup}>
            <label>Data e Hora de Início *</label>
            <input
              type="datetime-local"
              name="data_inicio"
              value={formData.data_inicio}
              onChange={handleChange}
              required
              className={styles.input}
            />
          </div>

          <div className={styles.formGroup}>
            <label>Data e Hora de Término</label>
            <input
              type="datetime-local"
              name="data_fim"
              value={formData.data_fim}
              onChange={handleChange}
              className={styles.input}
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Local</label>
          <input
            type="text"
            name="local"
            value={formData.local}
            onChange={handleChange}
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Responsável</label>
          <select
            name="responsavel_id"
            value={formData.responsavel_id}
            onChange={handleChange}
            className={styles.select}
          >
            <option value="">Selecione um responsável</option>
            {colaboradores.map(colab => (
              <option key={colab.id} value={colab.id}>
                {colab.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.formGroup}>
          <label>Convidar Colaboradores</label>
          <div className={styles.colaboradoresList}>
            {colaboradores.map(colab => (
              <label key={colab.id} className={styles.checkboxLabel}>
                <input
                  type="checkbox"
                  checked={colaboradoresSelecionados.includes(colab.id)}
                  onChange={() => handleColaboradorToggle(colab.id)}
                />
                <span>{colab.nome}</span>
              </label>
            ))}
          </div>
          <small className={styles.hint}>
            {colaboradoresSelecionados.length} colaborador(es) selecionado(s)
          </small>
        </div>

        <div className={styles.buttonGroup}>
          <button
            type="submit"
            disabled={loading}
            className={styles.submitButton}
          >
            {loading ? 'Criando...' : 'Criar Evento'}
          </button>
          <button
            type="button"
            onClick={() => router.back()}
            className={styles.cancelButton}
          >
            Cancelar
          </button>
        </div>
      </form>
    </div>
  );
}
