"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Mail, CheckCircle, XCircle, Trash2 } from "lucide-react";
import styles from "./detalheCotacao.module.css";
import cotacaoService from "@/services/cotacaoService";

export default function DetalheCotacaoPage({ params }) {
  const router = useRouter();
  const [cotacaoId, setCotacaoId] = useState(null);
  const [cotacao, setCotacao] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [motivoRejeicao, setMotivoRejeicao] = useState('');

  useEffect(() => {
    async function fetchParams() {
      const resolved = await params;
      setCotacaoId(resolved?.id);
    }
    fetchParams();
  }, [params]);

  useEffect(() => {
    if (cotacaoId) {
      fetchCotacao();
    }
  }, [cotacaoId]);

  const fetchCotacao = async () => {
    setLoading(true);
    setError('');
    try {
      const response = await cotacaoService.getCotacao(cotacaoId);
      setCotacao(response.data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleEnviarEmail = async () => {
    if (!confirm('Deseja enviar esta cotação por email?')) return;
    
    try {
      await cotacaoService.enviarEmail(cotacaoId);
      alert('Email enviado com sucesso!');
      fetchCotacao();
    } catch (err) {
      alert('Erro ao enviar email: ' + err.message);
    }
  };

  const handleAprovar = async () => {
    if (!confirm('Deseja aprovar esta cotação?')) return;
    
    try {
      await cotacaoService.aprovarCotacao(cotacaoId);
      alert('Cotação aprovada com sucesso!');
      fetchCotacao();
    } catch (err) {
      alert('Erro ao aprovar: ' + err.message);
    }
  };

  const handleRejeitar = async () => {
    try {
      await cotacaoService.rejeitarCotacao(cotacaoId, motivoRejeicao);
      alert('Cotação rejeitada');
      setShowRejectModal(false);
      setMotivoRejeicao('');
      fetchCotacao();
    } catch (err) {
      alert('Erro ao rejeitar: ' + err.message);
    }
  };

  const handleDelete = async () => {
    if (!confirm('Tem certeza que deseja excluir esta cotação? Esta ação não pode ser desfeita.')) return;
    
    try {
      await cotacaoService.deleteCotacao(cotacaoId);
      alert('Cotação excluída com sucesso!');
      router.push('/comercial/cotacoes');
    } catch (err) {
      alert('Erro ao excluir: ' + err.message);
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loading}>Carregando cotação...</div>
      </div>
    );
  }

  if (error || !cotacao) {
    return (
      <div className={styles.container}>
        <div className={styles.error}>{error || 'Cotação não encontrada'}</div>
      </div>
    );
  }

  const getStatusBadge = (status) => {
    const badges = {
      'Rascunho': <span className={styles.badgeRascunho}>Rascunho</span>,
      'Enviada': <span className={styles.badgeEnviada}>Enviada</span>,
      'Aceita': <span className={styles.badgeAceita}>Aceita</span>,
      'Recusada': <span className={styles.badgeRecusada}>Recusada</span>,
      'Expirada': <span className={styles.badgeExpirada}>Expirada</span>
    };
    return badges[status] || status;
  };

  const getAprovacaoBadge = (status) => {
    const badges = {
      'Pendente': <span className={styles.aprovacaoPendente}>Pendente</span>,
      'Aprovada': <span className={styles.aprovacaoAprovada}>Aprovada</span>,
      'Rejeitada': <span className={styles.aprovacaoRejeitada}>Rejeitada</span>
    };
    return badges[status] || status;
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <div className={styles.headerInfo}>
          <h1 className={styles.title}>{cotacao.codigo}</h1>
          <div className={styles.badges}>
            {getStatusBadge(cotacao.status)}
            {getAprovacaoBadge(cotacao.status_aprovacao)}
          </div>
        </div>
        <div className={styles.headerActions}>
          {cotacao.status_aprovacao === 'Pendente' && (
            <>
              <button onClick={handleAprovar} className={styles.aprovarButton}>
                <CheckCircle size={18} />
                Aprovar
              </button>
              <button onClick={() => setShowRejectModal(true)} className={styles.rejeitarButton}>
                <XCircle size={18} />
                Rejeitar
              </button>
            </>
          )}
          <button onClick={handleEnviarEmail} className={styles.emailButton}>
            <Mail size={18} />
            Enviar Email
          </button>
          <button onClick={handleDelete} className={styles.deleteButton}>
            <Trash2 size={18} />
            Excluir
          </button>
        </div>
      </header>

      <div className={styles.grid}>
        <div className={styles.mainColumn}>
          <div className={styles.card}>
            <h2 className={styles.cardTitle}>Dados da Cotação</h2>
            <div className={styles.infoGrid}>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Cliente:</span>
                <span className={styles.infoValue}>{cotacao.cliente_nome}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Tipo de Serviço:</span>
                <span className={styles.infoValue}>{cotacao.tipo_servico}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Origem:</span>
                <span className={styles.infoValue}>{cotacao.origem}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Destino:</span>
                <span className={styles.infoValue}>{cotacao.destino}</span>
              </div>
              {cotacao.codigo_iata_destino && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Código IATA:</span>
                  <span className={styles.infoValue}>{cotacao.codigo_iata_destino}</span>
                </div>
              )}
              {cotacao.peso_kg && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Peso:</span>
                  <span className={styles.infoValue}>{cotacao.peso_kg} kg</span>
                </div>
              )}
              {cotacao.km_percorrido && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>KM Percorrido:</span>
                  <span className={styles.infoValue}>{cotacao.km_percorrido} km</span>
                </div>
              )}
              {cotacao.tipo_veiculo && (
                <div className={styles.infoItem}>
                  <span className={styles.infoLabel}>Tipo de Veículo:</span>
                  <span className={styles.infoValue}>{cotacao.tipo_veiculo}</span>
                </div>
              )}
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Responsável:</span>
                <span className={styles.infoValue}>{cotacao.colaborador_nome}</span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Data de Criação:</span>
                <span className={styles.infoValue}>
                  {new Date(cotacao.criado_em).toLocaleString('pt-BR')}
                </span>
              </div>
              <div className={styles.infoItem}>
                <span className={styles.infoLabel}>Validade:</span>
                <span className={styles.infoValue}>
                  {new Date(cotacao.validade_ate).toLocaleDateString('pt-BR')}
                </span>
              </div>
            </div>
          </div>

          {cotacao.generalidades && cotacao.generalidades.length > 0 && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Generalidades Aplicadas</h2>
              <div className={styles.generalidadesList}>
                {cotacao.generalidades.map(gen => (
                  <div key={gen.id} className={styles.generalidadeItem}>
                    <span className={styles.generalidadeNome}>{gen.nome}</span>
                    <span className={styles.generalidadeValor}>
                      R$ {parseFloat(gen.valor_aplicado).toFixed(2).replace('.', ',')}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {cotacao.observacoes && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Observações</h2>
              <p className={styles.observacoes}>{cotacao.observacoes}</p>
            </div>
          )}

          {cotacao.motivo_rejeicao && (
            <div className={styles.card}>
              <h2 className={styles.cardTitle}>Motivo da Rejeição</h2>
              <p className={styles.motivoRejeicao}>{cotacao.motivo_rejeicao}</p>
            </div>
          )}
        </div>

        <div className={styles.sideColumn}>
          <div className={styles.valoresCard}>
            <h2 className={styles.cardTitle}>Valores</h2>
            <div className={styles.valorRow}>
              <span>Valor Base:</span>
              <span className={styles.valorTexto}>
                R$ {parseFloat(cotacao.valor_base_tabela || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
            {cotacao.valor_generalidades > 0 && (
              <div className={styles.valorRow}>
                <span>Generalidades:</span>
                <span className={styles.valorTexto}>
                  R$ {parseFloat(cotacao.valor_generalidades).toFixed(2).replace('.', ',')}
                </span>
              </div>
            )}
            <div className={styles.divider}></div>
            <div className={styles.valorRow}>
              <span className={styles.valorLabel}>Valor Cliente:</span>
              <span className={styles.valorDestaque}>
                R$ {parseFloat(cotacao.valor_cliente || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className={styles.divider}></div>
            <div className={styles.valorRow}>
              <span>Valor Agregado:</span>
              <span className={styles.valorTexto}>
                R$ {parseFloat(cotacao.valor_agregado || 0).toFixed(2).replace('.', ',')}
              </span>
            </div>
            <div className={styles.valorRow}>
              <span className={styles.valorLabel}>Rentabilidade:</span>
              <span className={styles.valorRentabilidade}>
                R$ {parseFloat(cotacao.valor_rentabilidade || 0).toFixed(2).replace('.', ',')}
                ({parseFloat(cotacao.percentual_rentabilidade || 0).toFixed(2)}%)
              </span>
            </div>
          </div>

          {cotacao.valores_agregado && (
            <div className={styles.valoresCard}>
              <h2 className={styles.cardTitle}>Detalhes Agregado</h2>
              <div className={styles.valorRow}>
                <span>Frete Agregado:</span>
                <span className={styles.valorTexto}>
                  R$ {parseFloat(cotacao.valores_agregado.valor_frete_agregado).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className={styles.valorRow}>
                <span>Valor KM:</span>
                <span className={styles.valorTexto}>
                  R$ {parseFloat(cotacao.valores_agregado.valor_km_agregado).toFixed(2).replace('.', ',')}
                </span>
              </div>
              <div className={styles.valorRow}>
                <span>KM Percorrido:</span>
                <span className={styles.valorTexto}>
                  {parseFloat(cotacao.valores_agregado.km_percorrido).toFixed(2)} km
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {showRejectModal && (
        <div className={styles.modal}>
          <div className={styles.modalContent}>
            <h2 className={styles.modalTitle}>Rejeitar Cotação</h2>
            <textarea
              value={motivoRejeicao}
              onChange={(e) => setMotivoRejeicao(e.target.value)}
              placeholder="Digite o motivo da rejeição..."
              className={styles.modalTextarea}
              rows={4}
            />
            <div className={styles.modalButtons}>
              <button onClick={() => setShowRejectModal(false)} className={styles.modalCancelButton}>
                Cancelar
              </button>
              <button onClick={handleRejeitar} className={styles.modalConfirmButton}>
                Confirmar Rejeição
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
