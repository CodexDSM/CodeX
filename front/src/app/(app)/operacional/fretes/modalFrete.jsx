'use client';
import { useState, useEffect } from 'react';
import styles from './modalFrete.module.css';

export function OSDetalhesModal({ os, onClose, onSave }) {
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState(os);
  const isLocked = os.status === 'Concluído';

  useEffect(() => {
    setFormData(os || {});
  }, [os]);

  if (!os) return null;

  const handleChange = e => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSave = () => {
    onSave(formData);
    setIsEditing(false);
  };

  const formatDate = dateString => {
    if (!dateString) return '-';
    return new Date(dateString).toLocaleDateString('pt-BR');
  };

  const formatInputDate = dateString => {
    if (!dateString) return '';
    return new Date(dateString).toISOString().split('T')[0];
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={e => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>{os.codigo}</h2>
            <span
              className={`${styles.badge} ${styles[os.status.replace(' ', '')]}`}
            >
              {os.status}
            </span>
          </div>
          <button onClick={onClose}>X</button>
        </div>

        <div className={styles.content}>
          <h3 className={styles.sectionTitle}>Informações do Cliente</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Cliente:</label>
              <p>{os.cliente}</p>
            </div>
            <div className={styles.field}>
              <label>Documento:</label>
              <p>{os.documento}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Rota</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Origem:</label>
              <p>{os.origem}</p>
            </div>
            <div className={styles.field}>
              <label>Destino:</label>
              <p>{os.destino}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Valores</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Valor do Frete:</label>
              <p>R$ {Number(os.valor || 0).toFixed(2)}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Dados Operacionais</h3>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Motorista:</label>
              {isEditing ? (
                <input
                  name="motorista_id"
                  value={formData.motorista_id || ''}
                  onChange={handleChange}
                  placeholder="ID do motorista"
                />
              ) : (
                <p>{os.motorista || 'Não designado'}</p>
              )}
            </div>

            <div className={styles.field}>
              <label>Veículo:</label>
              {isEditing ? (
                <input
                  name="veiculo"
                  value={formData.veiculo || ''}
                  onChange={handleChange}
                  placeholder="Placa ou identificação"
                />
              ) : (
                <p>{os.veiculo || 'Não designado'}</p>
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
              <p>{os.observacoes || 'Sem observações.'}</p>
            )}
          </div>
        </div>

        <div className={styles.footer}>
          {isEditing ? (
            <>
              <button
                onClick={() => setIsEditing(false)}
                className={styles.btnCancel}
              >
                Cancelar
              </button>
              <button onClick={handleSave} className={styles.btnSave}>
                Salvar Alterações
              </button>
            </>
          ) : isLocked ? (
            <span className={styles.lockedMessage}>
              🔒 Finalizado (Apenas Leitura)
            </span>
          ) : (
            <button
              onClick={() => setIsEditing(true)}
              className={styles.btnEdit}
            >
              Editar Informações
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
