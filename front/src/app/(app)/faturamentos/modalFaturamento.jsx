'use client';
import { useEffect, useState } from 'react';
import styles from '../operacional/fretes/modalFrete.module.css';

export function FaturamentoDetalhesModal({ faturamento, onClose }) {
  const [dados, setDados] = useState(faturamento || {});

  useEffect(() => {
    setDados(faturamento || {});
  }, [faturamento]);

  if (!faturamento) return null;

  const formatMoney = (value) =>
    `R ${Number(value || 0).toFixed(2).replace('.', ',')}`;

  const formatDateTime = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleString('pt-BR');
  };

  const formatDate = (value) => {
    if (!value) return '-';
    return new Date(value).toLocaleDateString('pt-BR');
  };

  return (
    <div className={styles.overlay} onClick={onClose}>
      <div className={styles.modal} onClick={(e) => e.stopPropagation()}>
        <div className={styles.header}>
          <div>
            <h2>{dados.frete_codigo || dados.frete_id || '-'}</h2>
            <span className={`${styles.badge} ${styles.Padrao}`}>
              Faturamento #{dados.id}
            </span>
          </div>
          <button onClick={onClose}>X</button>
        </div>

        <div className={styles.content}>
          <h3 className={styles.sectionTitle}>Resumo do Faturamento</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Valor faturado:</label>
              <p>{formatMoney(dados.valor)}</p>
            </div>
            <div className={styles.field}>
              <label>Criado em:</label>
              <p>{formatDateTime(dados.criado_em)}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Cliente</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Nome:</label>
              <p>{dados.cliente_nome || dados.cliente_id || '-'}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Vendedor</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Nome:</label>
              <p>{dados.vendedor_nome || dados.vendedor_id || '-'}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Frete</h3>
          <div className={styles.row}>
            <div className={styles.field}>
              <label>Origem:</label>
              <p>{dados.origem || '-'}</p>
            </div>
            <div className={styles.field}>
              <label>Destino:</label>
              <p>{dados.destino || '-'}</p>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Motorista:</label>
              <p>{dados.motorista_nome || '-'}</p>
            </div>
            <div className={styles.field}>
              <label>Veículo:</label>
              <p>{dados.veiculo || '-'}</p>
            </div>
          </div>

          <div className={styles.row}>
            <div className={styles.field}>
              <label>Previsão de entrega:</label>
              <p>{formatDate(dados.data_entrega_prevista)}</p>
            </div>
            <div className={styles.field}>
              <label>Coleta (real):</label>
              <p>{formatDate(dados.data_coleta)}</p>
            </div>
            <div className={styles.field}>
              <label>Entrega (real):</label>
              <p>{formatDate(dados.data_entrega)}</p>
            </div>
          </div>

          <h3 className={styles.sectionTitle}>Observações</h3>
          <div className={styles.field}>
            <p>{dados.observacoes || 'Sem observações.'}</p>
          </div>
        </div>

        <div className={styles.footer}>
          <button onClick={onClose} className={styles.btnCancel}>
            Fechar
          </button>
        </div>
      </div>
    </div>
  );
}
