"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import styles from "./generalidades.module.css";
import generalidadesService from "@/services/generalidadesService";

export default function GeneralidadesPage() {
  const [generalidades, setGeneralidades] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [mostrarInativas, setMostrarInativas] = useState(false);
  const [formData, setFormData] = useState({
    nome: '',
    descricao: '',
    tipo: 'fixo',
    valor: '',
    ativo: true
  });

  useEffect(() => {
    fetchGeneralidades();
  }, []);

  const fetchGeneralidades = async () => {
    setLoading(true);
    try {
      const response = await generalidadesService.getGeneralidades();
      setGeneralidades(response.data);
    } catch (error) {
      console.error('Erro ao carregar generalidades:', error);
      alert('Erro ao carregar generalidades');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (generalidade = null) => {
    if (generalidade) {
      setEditingId(generalidade.id);
      setFormData({
        nome: generalidade.nome,
        descricao: generalidade.descricao || '',
        tipo: generalidade.tipo,
        valor: generalidade.valor,
        ativo: generalidade.ativo
      });
    } else {
      setEditingId(null);
      setFormData({
        nome: '',
        descricao: '',
        tipo: 'fixo',
        valor: '',
        ativo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
    setFormData({
      nome: '',
      descricao: '',
      tipo: 'fixo',
      valor: '',
      ativo: true
    });
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    try {
      if (editingId) {
        await generalidadesService.updateGeneralidade(editingId, formData);
        alert('Generalidade atualizada com sucesso!');
      } else {
        await generalidadesService.createGeneralidade(formData);
        alert('Generalidade criada com sucesso!');
      }
      handleCloseModal();
      fetchGeneralidades();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta generalidade?')) return;
    
    try {
      await generalidadesService.deleteGeneralidade(id);
      alert('Generalidade excluída com sucesso!');
      fetchGeneralidades();
    } catch (error) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  // Filtrar generalidades
  const generalidadesFiltradas = mostrarInativas 
    ? generalidades 
    : generalidades.filter(g => g.ativo);

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Generalidades</h1>
        <div style={{ display: 'flex', gap: '1rem', alignItems: 'center' }}>
          <label style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.875rem', color: '#64748b' }}>
            <input
              type="checkbox"
              checked={mostrarInativas}
              onChange={(e) => setMostrarInativas(e.target.checked)}
              style={{ cursor: 'pointer' }}
            />
            Mostrar inativas
          </label>
          <button 
            onClick={() => handleOpenModal()} 
            className={styles.addButton}
          >
            <Plus size={20} />
            Nova Generalidade
          </button>
        </div>
      </header>

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Nome</th>
              <th>Descrição</th>
              <th>Tipo</th>
              <th>Valor</th>
              <th>Status</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="6" className={styles.loading}>Carregando...</td>
              </tr>
            ) : generalidadesFiltradas.length === 0 ? (
              <tr>
                <td colSpan="6" className={styles.empty}>
                  {mostrarInativas ? 'Nenhuma generalidade cadastrada' : 'Nenhuma generalidade ativa'}
                </td>
              </tr>
            ) : (
              generalidadesFiltradas.map((gen) => (
                <tr key={gen.id}>
                  <td className={styles.nome}>{gen.nome}</td>
                  <td className={styles.descricao}>{gen.descricao || '-'}</td>
                  <td>
                    <span className={gen.tipo === 'fixo' ? styles.tipoFixo : styles.tipoPercentual}>
                      {gen.tipo === 'fixo' ? 'Fixo' : 'Percentual'}
                    </span>
                  </td>
                  <td className={styles.valor}>
                    {gen.tipo === 'fixo' 
                      ? `R$ ${parseFloat(gen.valor).toFixed(2).replace('.', ',')}`
                      : `${parseFloat(gen.valor).toFixed(2)}%`
                    }
                  </td>
                  <td>
                    <span className={gen.ativo ? styles.statusAtivo : styles.statusInativo}>
                      {gen.ativo ? 'Ativo' : 'Inativo'}
                    </span>
                  </td>
                  <td className={styles.actions}>
                    <button onClick={() => handleOpenModal(gen)} className={styles.editButton}>
                      <Edit size={16} />
                    </button>
                    <button onClick={() => handleDelete(gen.id)} className={styles.deleteButton}>
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {editingId ? 'Editar Generalidade' : 'Nova Generalidade'}
            </h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              <div className={styles.field}>
                <label className={styles.label}>Nome *</label>
                <input
                  type="text"
                  name="nome"
                  value={formData.nome}
                  onChange={handleChange}
                  required
                  className={styles.input}
                  placeholder="Ex: Coleta 4h"
                />
              </div>

              <div className={styles.field}>
                <label className={styles.label}>Descrição</label>
                <textarea
                  name="descricao"
                  value={formData.descricao}
                  onChange={handleChange}
                  className={styles.textarea}
                  rows={3}
                  placeholder="Descrição detalhada..."
                />
              </div>

              <div className={styles.fieldRow}>
                <div className={styles.field}>
                  <label className={styles.label}>Tipo *</label>
                  <select
                    name="tipo"
                    value={formData.tipo}
                    onChange={handleChange}
                    required
                    className={styles.select}
                  >
                    <option value="fixo">Fixo (R$)</option>
                    <option value="percentual">Percentual (%)</option>
                  </select>
                </div>

                <div className={styles.field}>
                  <label className={styles.label}>Valor *</label>
                  <input
                    type="number"
                    name="valor"
                    value={formData.valor}
                    onChange={handleChange}
                    required
                    step="0.01"
                    min="0"
                    className={styles.input}
                    placeholder={formData.tipo === 'fixo' ? '0.00' : '0.00%'}
                  />
                </div>
              </div>

              <div className={styles.checkboxField}>
                <input
                  type="checkbox"
                  name="ativo"
                  checked={formData.ativo}
                  onChange={handleChange}
                  id="ativo"
                />
                <label htmlFor="ativo">Ativo</label>
              </div>

              <div className={styles.modalButtons}>
                <button type="button" onClick={handleCloseModal} className={styles.cancelButton}>
                  Cancelar
                </button>
                <button type="submit" className={styles.saveButton}>
                  {editingId ? 'Salvar Alterações' : 'Criar Generalidade'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
