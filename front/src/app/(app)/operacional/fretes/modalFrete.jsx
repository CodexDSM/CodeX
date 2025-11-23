'use client';
import { useState, useEffect } from 'react';
import styles from './modalFrete.module.css';

export function OSDetalhesModal({ os, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(os || {});
  const isLocked = (os && os.status) === 'Concluído';

  useEffect(() => {
    setFormData(os || {});
  }, [os]);

  if (!os) return null;

  // Função genérica para atualizar os campos
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  // Formata data para exibição (dd/mm/aaaa)
  const formatDate = (dateString) => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  // Formata data para o input do tipo date (aaaa-mm-dd)
  const formatInputDate = (dateString) => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        
      
        <div className={styles.header}>
          <div>
            <h2>{os.codigo}</h2>
            <span className={`${styles.badge} ${styles[os.status.replace(' ', '')]}`}>
              {os.status}
            </span>
          </div>
          <button onClick={onClose}>X</button>
        </div>

        <div className={styles.content}>
          
          {/* --- SEÇÃO 1: CLIENTE (Apenas Leitura) --- */}
          <h3 className={styles.sectionTitle}>Informações do Cliente</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Cliente:</label>
              <p>{os.cliente_nome || os.cliente || os.cliente_id || '—'}</p>
            </div>
            <div className={styles.field}>
              <label>Vendedor Responsável:</label>
              <p>{os.colaborador_nome || os.colaborador || os.colaborador_id || '—'}</p>
            </div>
          </div>

          {/* --- SEÇÃO 2: ROTA E CARGA (Apenas Leitura) --- */}
          <h3 className={styles.sectionTitle}>Rota e Carga</h3>
          <div className={styles.row}>
             <div className={styles.field}>
              <label>Origem:</label>
              <p>{(os.origem || os.origem_cidade || os.origemCidade || os.origem_texto) || '—' }{(os.origem_uf || os.origemUf) ? ` - ${os.origem_uf || os.origemUf}` : ''}</p>
            </div>
            <div className={styles.field}>
              <label>Destino:</label>
              <p>{(os.destino || os.destino_cidade || os.destinoCidade || os.destino_texto) || '—' }{(os.destino_uf || os.destinoUf) ? ` - ${os.destino_uf || os.destinoUf}` : ''}</p>
            </div>
          </div>
          
          <div className={styles.row}>
             <div className={styles.field}>
              <label>Peso (kg):</label>
              <p>{(os.peso_kg || os.peso || 0)} kg</p>
            </div>
            <div className={styles.field}>
              <label>Valor do Frete:</label>
              <p>R$ {(Number(os.valor || os.valor_total || 0)).toFixed(2)}</p>
            </div>
             <div className={styles.field}>
              <label>Distância:</label>
              <p>{(os.distancia_km || os.km_percorrido || os.distancia || 0)} km</p>
            </div>
          </div>

          {/* --- SEÇÃO 3: OPERACIONAL (Editável) --- */}
          <h3 className={styles.sectionTitle}>Dados Operacionais</h3>
          
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Motorista:</label>
              {isEditing ? (
                <input 
                  name="motorista_nome" 
                  value={formData.motorista_nome || ''} 
                  onChange={handleChange} 
                  placeholder="Nome do motorista"
                />
                // Nota: No futuro, isso deve ser um <select> buscando da API de motoristas
              ) : (
                <p>{os.motorista_nome || 'Não designado'}</p>
              )}
            </div>
            
            <div className={styles.field}>
              <label>Veículo:</label>
              {isEditing ? (
                <input 
                  name="veiculo_id" 
                  value={formData.veiculo_id || ''} 
                  onChange={handleChange}
                  placeholder="Placa ou ID"
                />
              ) : (
                <p>{os.veiculo_id || 'Não designado'}</p>
              )}
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Previsão de Entrega:</label>
              <p>{formatDate(os.data_entrega_prevista || os.validade_ate || os.previsao_entrega)}</p>
            </div>

            <div className={styles.field}>
              <label>Data Coleta (Real):</label>
              {isEditing ? (
                <input 
                  type="date"
                  name="data_coleta"
                  value={formatInputDate(formData.data_coleta || formData.data_coleta_real || '')}
                  onChange={handleChange}
                />
              ) : (
                <p>{formatDate(os.data_coleta || os.data_coleta_real)}</p>
              )}
            </div>

            <div className={styles.field}>
              <label>Data Entrega (Real):</label>
              {isEditing ? (
                <input 
                  type="date"
                  name="data_entrega"
                  value={formatInputDate(formData.data_entrega || formData.data_entrega_real || '')}
                  onChange={handleChange}
                />
              ) : (
                <p>{formatDate(os.data_entrega || os.data_entrega_real)}</p>
              )}
            </div>
          </div>

           <div className={styles.field}>
              <label>Observações:</label>
              {isEditing ? (
                <textarea 
                  name="observacoes"
                  value={formData.observacoes || ''} 
                  onChange={handleChange}
                  rows={3}
                />
              ) : (
                <p>{os.observacoes || os.observacao || 'Sem observações.'}</p>
              )}
           </div>

        </div>

        {/* --- RODAPÉ --- */}
        <div className={styles.footer}>
           {isEditing ? (
             <>
               <button onClick={() => setIsEditing(false)} className={styles.btnCancel}>Cancelar</button>
               <button onClick={handleSave} className={styles.btnSave}>Salvar Alterações</button>
             </>
           ) : (
             // 2. Lógica de Exibição Condicional
             isLocked ? (
               <span className={styles.lockedMessage}>
                 🔒 Finalizado (Apenas Leitura)
               </span>
             ) : (
               <button onClick={() => setIsEditing(true)} className={styles.btnEdit}>
                 Editar Informações
               </button>
             )
           )}
        </div>

      </div>
    </div>
  );
}