"use client";
import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { getApiUrl } from "@/lib/apiConfig";
import { EventoTable } from "@/features/administrativo/eventoTable";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Link from "next/link";
import { CalendarPlus, MapPin } from "lucide-react";
import styles from "./eventos.module.css";

export default function PaginaEventos() {
  const router = useRouter();
  const [eventos, setEventos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [filters, setFilters] = useState({
    search: '',
    local: '',
    ativo: 'true',
    tipo_evento: ''
  });

  const [sortConfig, setSortConfig] = useState({ key: "titulo", direction: "ascending" });

  const fetchEventos = async () => {
    setLoading(true);
    setError('');

    try {
      const token = localStorage.getItem('authToken');
      const params = new URLSearchParams();

      // Apenas filtros, SEM page e limit
      if (filters.search) params.append('search', filters.search);
      if (filters.local) params.append('local', filters.local);
      if (filters.ativo !== '') params.append('ativo', filters.ativo);
      if (filters.tipo_evento) params.append('tipo_evento', filters.tipo_evento);

      console.log('Enviando parâmetros:', Object.fromEntries(params));

      const response = await fetch(`${getApiUrl('eventos')}?${params}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        const data = await response.json();
        setEventos(data);
        console.log(`Total de eventos carregados: ${data.length}`);
      } else {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Erro ao carregar eventos');
      }
    } catch (err) {
      setError(err.message);
      console.error('Erro ao carregar eventos:', err);
      if (err.message.includes('Não autorizado') || err.message.includes('Token')) {
        alert('Sessão expirada. Faça login novamente.');
        router.push('/login');
      }
    } finally {
      setLoading(false);
    }
  };


  useEffect(() => {
    fetchEventos();
  }, [filters]);


  const handleFilterChange = (key, value) => {
    console.log(`Alterando filtro ${key} para:`, value);
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
    <CardContent>
      <header className={styles.header}>
        <div className={styles.filters}>
          <Select
            value={filters.tipo_evento || undefined}
            onValueChange={(value) => handleFilterChange('tipo_evento', value)}
          >
            <SelectTrigger style={{ width: '200px' }}>
              <SelectValue placeholder="Tipo de Evento" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPTY_VALUE">Todos</SelectItem>
              <SelectItem value="Palestra">Palestra</SelectItem>
              <SelectItem value="Workshop">Workshop</SelectItem>
              <SelectItem value="Treinamento">Treinamento</SelectItem>
              <SelectItem value="Congresso">Congresso</SelectItem>
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
              <SelectItem value="false">Encerrados</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.local || undefined}
            onValueChange={(value) => handleFilterChange('local', value)}
          >
            <SelectTrigger style={{ width: '200px' }}>
              <SelectValue placeholder="Local" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="EMPTY_VALUE">Todos</SelectItem>
              <SelectItem value="Auditório">Auditório</SelectItem>
              <SelectItem value="Sala de Reuniões">Sala de Reuniões</SelectItem>
              <SelectItem value="Online">Online</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className={styles.buttons}>
          <Link href="/administrativo/eventos/novo">
            <Button variant="adicionarenv">
              <CalendarPlus size={20} />
              Adicionar Evento
            </Button>
          </Link>
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

      <EventoTable
        eventos={eventos}
        loading={loading}
        onSort={requestSort}
        sortConfig={sortConfig}
      />
    </CardContent >
  );
}
