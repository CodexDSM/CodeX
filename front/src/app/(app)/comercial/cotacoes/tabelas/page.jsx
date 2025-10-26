"use client";
import { useState, useEffect } from "react";
import { Plus, Edit, Trash2 } from "lucide-react";
import styles from "./tabelas.module.css";
import tabelaPrecoService from "@/services/tabelaPrecoService";
import clienteService from "@/services/clienteService";

export default function TabelasPrecoPage() {
  const [clientes, setClientes] = useState([]);
  const [clienteSelecionado, setClienteSelecionado] = useState('');
  const [tipoServicoSelecionado, setTipoServicoSelecionado] = useState('WEAir Convencional');
  const [tabelas, setTabelas] = useState([]);
  const [loading, setLoading] = useState(false);
  const [showModal, setShowModal] = useState(false);
  const [editingId, setEditingId] = useState(null);
  
  const [formData, setFormData] = useState({
    cliente_id: '',
    tipo_servico: 'WEAir Convencional',
    codigo_iata: '',
    destino: '',
    tipo_veiculo: '',
    frete_minimo: '',
    valor_kg_excedente: '',
    peso_minimo: '',
    peso_maximo: '',
    km_minimo: '',
    valor_km_excedente: '',
    capacidade_peso_min: '',
    capacidade_peso_max: '',
    diaria_veiculo: '',
    ativo: true
  });

  useEffect(() => {
    fetchClientes();
  }, []);

  useEffect(() => {
    if (clienteSelecionado) {
      fetchTabelas();
    }
  }, [clienteSelecionado, tipoServicoSelecionado]);

  const fetchClientes = async () => {
    try {
      const response = await clienteService.getClientes({ limit: 1000 });
      setClientes(response.data);
    } catch (error) {
      console.error('Erro ao carregar clientes:', error);
    }
  };

  const fetchTabelas = async () => {
    setLoading(true);
    try {
      const response = await tabelaPrecoService.getTabelasByCliente(
        clienteSelecionado,
        tipoServicoSelecionado
      );
      setTabelas(response.data);
    } catch (error) {
      console.error('Erro ao carregar tabelas:', error);
      setTabelas([]);
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (tabela = null) => {
    if (tabela) {
      setEditingId(tabela.id);
      setFormData({
        cliente_id: tabela.cliente_id,
        tipo_servico: tabela.tipo_servico,
        codigo_iata: tabela.codigo_iata || '',
        destino: tabela.destino || '',
        tipo_veiculo: tabela.tipo_veiculo || '',
        frete_minimo: tabela.frete_minimo,
        valor_kg_excedente: tabela.valor_kg_excedente || '',
        peso_minimo: tabela.peso_minimo || '',
        peso_maximo: tabela.peso_maximo || '',
        km_minimo: tabela.km_minimo || '',
        valor_km_excedente: tabela.valor_km_excedente || '',
        capacidade_peso_min: tabela.capacidade_peso_min || '',
        capacidade_peso_max: tabela.capacidade_peso_max || '',
        diaria_veiculo: tabela.diaria_veiculo || '',
        ativo: tabela.ativo
      });
    } else {
      setEditingId(null);
      setFormData({
        cliente_id: clienteSelecionado,
        tipo_servico: tipoServicoSelecionado,
        codigo_iata: '',
        destino: '',
        tipo_veiculo: '',
        frete_minimo: '',
        valor_kg_excedente: '',
        peso_minimo: '',
        peso_maximo: '',
        km_minimo: '',
        valor_km_excedente: '',
        capacidade_peso_min: '',
        capacidade_peso_max: '',
        diaria_veiculo: '',
        ativo: true
      });
    }
    setShowModal(true);
  };

  const handleCloseModal = () => {
    setShowModal(false);
    setEditingId(null);
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
        await tabelaPrecoService.updateTabela(editingId, formData);
        alert('Tabela atualizada com sucesso!');
      } else {
        await tabelaPrecoService.createTabela(formData);
        alert('Tabela criada com sucesso!');
      }
      handleCloseModal();
      fetchTabelas();
    } catch (error) {
      alert('Erro ao salvar: ' + error.message);
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Tem certeza que deseja excluir esta tabela de preço?')) return;
    
    try {
      await tabelaPrecoService.deleteTabela(id);
      alert('Tabela excluída com sucesso!');
      fetchTabelas();
    } catch (error) {
      alert('Erro ao excluir: ' + error.message);
    }
  };

  const isAereo = tipoServicoSelecionado.includes('WEAir');
  const isRodoviario = tipoServicoSelecionado === 'WExpress';

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1 className={styles.title}>Tabelas de Preços por Cliente</h1>
      </header>

      <div className={styles.filters}>
        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Cliente:</label>
          <select
            value={clienteSelecionado}
            onChange={(e) => setClienteSelecionado(e.target.value)}
            className={styles.select}
          >
            <option value="">Selecione um cliente</option>
            {clientes.map(cliente => (
              <option key={cliente.id} value={cliente.id}>
                {cliente.nome}
              </option>
            ))}
          </select>
        </div>

        <div className={styles.filterGroup}>
          <label className={styles.filterLabel}>Tipo de Serviço:</label>
          <select
            value={tipoServicoSelecionado}
            onChange={(e) => setTipoServicoSelecionado(e.target.value)}
            className={styles.select}
            disabled={!clienteSelecionado}
          >
            <option value="WEAir Convencional">WEAir Convencional</option>
            <option value="WEAir Expresso">WEAir Expresso</option>
            <option value="WEAir Proximo Voo">WEAir Próximo Voo</option>
            <option value="WExpress">WExpress</option>
            <option value="LT WEAir NEWE">LT WEAir NEWE</option>
          </select>
        </div>

        {clienteSelecionado && (
          <button 
            onClick={() => handleOpenModal()}
            className={styles.addButton}
          >
            <Plus size={20} />
            Adicionar
          </button>
        )}
      </div>

      {!clienteSelecionado ? (
        <div className={styles.empty}>Selecione um cliente para visualizar as tabelas de preços</div>
      ) : (
        <div className={styles.tableContainer}>
          <table className={styles.table}>
            <thead>
              <tr>
                {isAereo && <th>IATA</th>}
                <th>Destino</th>
                {isRodoviario && <th>Veículo</th>}
                <th>Frete Mínimo</th>
                {isAereo && <th>Valor/Kg</th>}
                {isAereo && <th>Peso Mín</th>}
                {isRodoviario && <th>KM Mín</th>}
                {isRodoviario && <th>Valor/KM</th>}
                <th>Status</th>
                <th>Ações</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="10" className={styles.loading}>Carregando...</td>
                </tr>
              ) : tabelas.length === 0 ? (
                <tr>
                  <td colSpan="10" className={styles.empty}>
                    Nenhuma tabela cadastrada para este cliente e serviço
                  </td>
                </tr>
              ) : (
                tabelas.map((tabela) => (
                  <tr key={tabela.id}>
                    {isAereo && <td className={styles.iata}>{tabela.codigo_iata || '-'}</td>}
                    <td>{tabela.destino || '-'}</td>
                    {isRodoviario && <td>{tabela.tipo_veiculo || '-'}</td>}
                    <td className={styles.valor}>
                      R$ {parseFloat(tabela.frete_minimo).toFixed(2).replace('.', ',')}
                    </td>
                    {isAereo && (
                      <td className={styles.valor}>
                        {tabela.valor_kg_excedente 
                          ? `R$ ${parseFloat(tabela.valor_kg_excedente).toFixed(2).replace('.', ',')}`
                          : '-'
                        }
                      </td>
                    )}
                    {isAereo && (
                      <td>
                        {tabela.peso_minimo 
                          ? `${parseFloat(tabela.peso_minimo).toFixed(2)} kg`
                          : '-'
                        }
                      </td>
                    )}
                    {isRodoviario && (
                      <td>
                        {tabela.km_minimo 
                          ? `${tabela.km_minimo} km`
                          : '-'
                        }
                      </td>
                    )}
                    {isRodoviario && (
                      <td className={styles.valor}>
                        {tabela.valor_km_excedente 
                          ? `R$ ${parseFloat(tabela.valor_km_excedente).toFixed(2).replace('.', ',')}`
                          : '-'
                        }
                      </td>
                    )}
                    <td>
                      <span className={tabela.ativo ? styles.statusAtivo : styles.statusInativo}>
                        {tabela.ativo ? 'Ativo' : 'Inativo'}
                      </span>
                    </td>
                    <td className={styles.actions}>
                      <button onClick={() => handleOpenModal(tabela)} className={styles.editButton}>
                        <Edit size={16} />
                      </button>
                      <button onClick={() => handleDelete(tabela.id)} className={styles.deleteButton}>
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      )}

      {showModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>
              {editingId ? 'Editar Tabela de Preço' : 'Nova Tabela de Preço'}
            </h2>
            
            <form onSubmit={handleSubmit} className={styles.form}>
              {isAereo && (
                <>
                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Código IATA</label>
                      <input
                        type="text"
                        name="codigo_iata"
                        value={formData.codigo_iata}
                        onChange={handleChange}
                        className={styles.input}
                        placeholder="Ex: GRU"
                        maxLength={3}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Destino *</label>
                      <input
                        type="text"
                        name="destino"
                        value={formData.destino}
                        onChange={handleChange}
                        required
                        className={styles.input}
                        placeholder="Ex: São Paulo"
                      />
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Frete Mínimo (R$) *</label>
                      <input
                        type="number"
                        name="frete_minimo"
                        value={formData.frete_minimo}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Valor Kg Excedente (R$)</label>
                      <input
                        type="number"
                        name="valor_kg_excedente"
                        value={formData.valor_kg_excedente}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Peso Mínimo (kg)</label>
                      <input
                        type="number"
                        name="peso_minimo"
                        value={formData.peso_minimo}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Peso Máximo (kg)</label>
                      <input
                        type="number"
                        name="peso_maximo"
                        value={formData.peso_maximo}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>
                  </div>
                </>
              )}

              {isRodoviario && (
                <>
                  <div className={styles.field}>
                    <label className={styles.label}>Tipo de Veículo *</label>
                    <select
                      name="tipo_veiculo"
                      value={formData.tipo_veiculo}
                      onChange={handleChange}
                      required
                      className={styles.select}
                    >
                      <option value="">Selecione</option>
                      <option value="Fiorino">Fiorino</option>
                      <option value="Van">Van</option>
                      <option value="VUC">VUC</option>
                      <option value="03/04">03/04</option>
                      <option value="Truck">Truck</option>
                      <option value="Carreta 2 eixos">Carreta 2 eixos</option>
                      <option value="Carreta 3 eixos">Carreta 3 eixos</option>
                      <option value="Carreta Cavalo Trucado">Carreta Cavalo Trucado</option>
                      <option value="Carreta Prancha">Carreta Prancha</option>
                    </select>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Frete Mínimo (R$) *</label>
                      <input
                        type="number"
                        name="frete_minimo"
                        value={formData.frete_minimo}
                        onChange={handleChange}
                        required
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>KM Mínimo</label>
                      <input
                        type="number"
                        name="km_minimo"
                        value={formData.km_minimo}
                        onChange={handleChange}
                        min="0"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Valor KM Excedente (R$)</label>
                      <input
                        type="number"
                        name="valor_km_excedente"
                        value={formData.valor_km_excedente}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Diária Veículo (R$)</label>
                      <input
                        type="number"
                        name="diaria_veiculo"
                        value={formData.diaria_veiculo}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>
                  </div>

                  <div className={styles.fieldRow}>
                    <div className={styles.field}>
                      <label className={styles.label}>Capacidade Mín (kg)</label>
                      <input
                        type="number"
                        name="capacidade_peso_min"
                        value={formData.capacidade_peso_min}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>

                    <div className={styles.field}>
                      <label className={styles.label}>Capacidade Máx (kg)</label>
                      <input
                        type="number"
                        name="capacidade_peso_max"
                        value={formData.capacidade_peso_max}
                        onChange={handleChange}
                        step="0.01"
                        min="0"
                        className={styles.input}
                      />
                    </div>
                  </div>
                </>
              )}

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
                  {editingId ? 'Salvar Alterações' : 'Criar Tabela'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
