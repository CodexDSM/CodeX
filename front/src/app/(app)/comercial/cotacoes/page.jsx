"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Plus } from "lucide-react";
import Link from "next/link";
import styles from "./cotacoes.module.css";
import cotacaoService from "@/services/cotacaoService";

export default function CotacoesPage() {
  const router = useRouter();
  const [cotacoes, setCotacoes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0
  });

  const [filters, setFilters] = useState({
    status: '',
    status_aprovacao: '',
    tipo_servico: ''
  });

  const fetchCotacoes = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await cotacaoService.getCotacoes({
        page,
        limit: pagination.limit,
        ...filters
      });
      
      setCotacoes(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar cotações:', err);
      
      if (err.message.includes('Não autorizado') || err.message.includes('Token')) {
        alert('Sessão expirada. Faça login novamente.');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCotacoes(1);
  }, [filters]);

  const handlePageChange = (newPage) => {
    fetchCotacoes(newPage);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'TODOS' ? '' : value
    }));
  };

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
        <h1 className={styles.title}>Cotações de Frete</h1>
      </header>

      <div className={styles.filters}>
        <div className={styles.filtersLeft}>
          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Status:</label>
            <select
              value={filters.status || 'TODOS'}
              onChange={(e) => handleFilterChange('status', e.target.value)}
              className={styles.select}
            >
              <option value="TODOS">Todos Status</option>
              <option value="Rascunho">Rascunho</option>
              <option value="Enviada">Enviada</option>
              <option value="Aceita">Aceita</option>
              <option value="Recusada">Recusada</option>
              <option value="Expirada">Expirada</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Aprovação:</label>
            <select
              value={filters.status_aprovacao || 'TODOS'}
              onChange={(e) => handleFilterChange('status_aprovacao', e.target.value)}
              className={styles.select}
            >
              <option value="TODOS">Todas Aprovações</option>
              <option value="Pendente">Pendente</option>
              <option value="Aprovada">Aprovada</option>
              <option value="Rejeitada">Rejeitada</option>
            </select>
          </div>

          <div className={styles.filterGroup}>
            <label className={styles.filterLabel}>Serviço:</label>
            <select
              value={filters.tipo_servico || 'TODOS'}
              onChange={(e) => handleFilterChange('tipo_servico', e.target.value)}
              className={styles.select}
            >
              <option value="TODOS">Todos Serviços</option>
              <option value="WEAir Convencional">WEAir Convencional</option>
              <option value="WEAir Expresso">WEAir Expresso</option>
              <option value="WEAir Proximo Voo">WEAir Próximo Voo</option>
              <option value="LT WEAir NEWE">LT WEAir NEWE</option>
              <option value="WExpress">WExpress</option>
            </select>
          </div>
        </div>

        <Link href="/comercial/cotacoes/nova">
          <button className={styles.newButton}>
            <Plus size={20} />
            Nova Cotação
          </button>
        </Link>
      </div>

      {error && (
        <div className={styles.error}>{error}</div>
      )}

      <div className={styles.tableContainer}>
        <table className={styles.table}>
          <thead>
            <tr>
              <th>Código</th>
              <th>Cliente</th>
              <th>Tipo Serviço</th>
              <th>Origem → Destino</th>
              <th>Valor Cliente</th>
              <th>Status</th>
              <th>Aprovação</th>
              <th>Data</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan="8" className={styles.loading}>Carregando...</td>
              </tr>
            ) : cotacoes.length === 0 ? (
              <tr>
                <td colSpan="8" className={styles.empty}>Nenhuma cotação encontrada</td>
              </tr>
            ) : (
              cotacoes.map((cotacao) => (
                <tr 
                  key={cotacao.id} 
                  onClick={() => router.push(`/comercial/cotacoes/${cotacao.id}`)}
                  className={styles.row}
                >
                  <td className={styles.codigo}>{cotacao.codigo}</td>
                  <td>{cotacao.cliente_nome}</td>
                  <td className={styles.tipoServico}>{cotacao.tipo_servico}</td>
                  <td>{cotacao.origem} → {cotacao.destino}</td>
                  <td className={styles.valor}>
                    R$ {parseFloat(cotacao.valor_cliente || 0).toFixed(2).replace('.', ',')}
                  </td>
                  <td>{getStatusBadge(cotacao.status)}</td>
                  <td>{getAprovacaoBadge(cotacao.status_aprovacao)}</td>
                  <td className={styles.data}>
                    {new Date(cotacao.criado_em).toLocaleDateString('pt-BR')}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {pagination.totalPages > 1 && (
        <div className={styles.pagination}>
          <div className={styles.paginationInfo}>
            Mostrando {((pagination.page - 1) * pagination.limit) + 1} a{' '}
            {Math.min(pagination.page * pagination.limit, pagination.total)} de{' '}
            {pagination.total} registros
          </div>
          
          <div className={styles.paginationButtons}>
            <button
              className={styles.paginationButton}
              disabled={pagination.page === 1}
              onClick={() => handlePageChange(pagination.page - 1)}
            >
              Anterior
            </button>
            
            {Array.from({ length: Math.min(5, pagination.totalPages) }, (_, i) => {
              let pageNum;
              if (pagination.totalPages <= 5) {
                pageNum = i + 1;
              } else if (pagination.page <= 3) {
                pageNum = i + 1;
              } else if (pagination.page >= pagination.totalPages - 2) {
                pageNum = pagination.totalPages - 4 + i;
              } else {
                pageNum = pagination.page - 2 + i;
              }

              return (
                <button
                  key={pageNum}
                  className={pageNum === pagination.page ? styles.paginationButtonActive : styles.paginationButton}
                  onClick={() => handlePageChange(pageNum)}
                >
                  {pageNum}
                </button>
              );
            })}
            
            <button
              className={styles.paginationButton}
              disabled={pagination.page === pagination.totalPages}
              onClick={() => handlePageChange(pagination.page + 1)}
            >
              Próxima
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
