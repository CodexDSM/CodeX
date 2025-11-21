"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { ColaboradorTable } from "@/features/administrativo/colaboradorTable";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { UserRoundPlus } from "lucide-react";
import styles from "./colaborador.module.css";
import colaboradorService from "@/services/colaboradorService";

export default function PaginaColaboradores() {
  const router = useRouter();
  const [colaboradores, setColaboradores] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [pagination, setPagination] = useState({
    current_page: 1,
    per_page: 10,
    total_records: 0,
    total_pages: 0,
    has_next: false,
    has_prev: false
  });

  const [filters, setFilters] = useState({
    search: '',
    perfil: '',
    ativo: 'true',
    tipo_localizacao: ''
  });

  const [sortConfig, setSortConfig] = useState({ key: "nome", direction: "ascending" });

  const fetchColaboradores = async (page = 1) => {
    setLoading(true);
    setError('');
    try {
      const response = await colaboradorService.getColaboradores({
        page,
        limit: pagination.per_page,
        ...filters
      });
      setColaboradores(response.data);
      setPagination(response.pagination);
    } catch (err) {
      setError(err.message);
      if (err.message.includes('Não autorizado') || err.message.includes('Token')) {
        alert('Sessão expirada. Faça login novamente.');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchColaboradores(1);
  }, [filters]);

  const handlePageChange = (newPage) => {
    fetchColaboradores(newPage);
  };

  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value === 'EMPTY_VALUE' ? '' : value
    }));
  };

  const requestSort = (key) => {
    let direction = "ascending";
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending";
    }
    setSortConfig({ key, direction });
  };

  return (
    <div className={styles.container}>
      <CardContent>
        <header>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            marginBottom: '1rem'
          }}>
            <div style={{
              display: 'flex',
              gap: '2rem',
              alignItems: 'center'
            }}>
              <Select
                value={filters.perfil || undefined}
                onValueChange={(value) => handleFilterChange('perfil', value)}
              >
                <SelectTrigger style={{ width: '180px' }}>
                  <SelectValue placeholder="Perfil" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPTY_VALUE">Todos</SelectItem>
                  <SelectItem value="Administrador">Administrador</SelectItem>
                  <SelectItem value="Gerente">Gerente</SelectItem>
                  <SelectItem value="Operador">Operador</SelectItem>
                  <SelectItem value="Motorista">Motorista</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.ativo || undefined}
                onValueChange={(value) => handleFilterChange('ativo', value)}
              >
                <SelectTrigger style={{ width: '180px' }}>
                  <SelectValue placeholder="Status" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPTY_VALUE">Todos</SelectItem>
                  <SelectItem value="true">Ativos</SelectItem>
                  <SelectItem value="false">Inativos</SelectItem>
                </SelectContent>
              </Select>

              <Select
                value={filters.tipo_localizacao || undefined}
                onValueChange={(value) => handleFilterChange('tipo_localizacao', value)}
              >
                <SelectTrigger style={{ width: '180px' }}>
                  <SelectValue placeholder="Localização" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="EMPTY_VALUE">Todas</SelectItem>
                  <SelectItem value="Presencial">Presencial</SelectItem>
                  <SelectItem value="Home Office">Home Office</SelectItem>
                  <SelectItem value="Evento">Evento</SelectItem>
                  <SelectItem value="Treinamento">Treinamento</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Link href="/administrativo/colaboradores/novo">
                <Button variant="add">
                  <UserRoundPlus size={20} />
                  Adicionar
                </Button>
              </Link>
            </div>
          </div>
        </header>

        {error && (
          <div style={{
            backgroundColor: '#fee',
            border: '1px solid #fcc',
            color: '#c00',
            padding: '1rem',
            borderRadius: '4px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <div className={styles.listBox}>
          <ColaboradorTable
            colaboradores={colaboradores}
            loading={loading}
            onSort={requestSort}
            sortConfig={sortConfig}
          />
        </div>

        {pagination.total_pages > 1 && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            marginTop: '1rem'
          }}>
            <div style={{ fontSize: '0.875rem', color: '#666' }}>
              Mostrando {((pagination.current_page - 1) * pagination.per_page) + 1} a{' '}
              {Math.min(pagination.current_page * pagination.per_page, pagination.total_records)} de{' '}
              {pagination.total_records} registros
            </div>

            <div style={{ display: 'flex', gap: '0.5rem' }}>
              <Button
                variant="primary"
                disabled={!pagination.has_prev}
                onClick={() => handlePageChange(pagination.current_page - 1)}
              >
                Anterior
              </Button>
              {Array.from({ length: Math.min(5, pagination.total_pages) }, (_, i) => {
                let pageNum;
                if (pagination.total_pages <= 5) {
                  pageNum = i + 1;
                } else if (pagination.current_page <= 3) {
                  pageNum = i + 1;
                } else if (pagination.current_page >= pagination.total_pages - 2) {
                  pageNum = pagination.total_pages - 4 + i;
                } else {
                  pageNum = pagination.current_page - 2 + i;
                }
                return (
                  <Button
                    key={pageNum}
                    variant={pageNum === pagination.current_page ? "add" : "primary"}
                    onClick={() => handlePageChange(pageNum)}
                  >
                    {pageNum}
                  </Button>
                );
              })}
              <Button
                variant="primary"
                disabled={!pagination.has_next}
                onClick={() => handlePageChange(pagination.current_page + 1)}
              >
                Próxima
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </div>
  );
}
