'use client';

import styles from './header.module.css';
import { Bell, ArrowLeft, ChevronDown } from 'lucide-react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const id = params?.id;

  // Dados SEMPRE do usuário logado (lado direito, nunca mudam)
  const [nomeLogado, setNomeLogado] = useState('');
  const [emailLogado, setEmailLogado] = useState('');
  const [colaboradorId, setColaboradorId] = useState(null);

  // Nome do colaborador/cliente acessado (detalhe, lado ESQUERDO)
  const [nomeEntidade, setNomeEntidade] = useState('');

  // Localização atual
  const [localizacao, setLocalizacao] = useState('Presencial');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  // Mapear nomes de exibição para valores da API
  const localizacaoMap = {
    'Presencial': 'Presencial',
    'Home Office': 'Home Office', 
    'Evento': 'Evento',
    'Treinamento': 'Treinamento'
  };

  const localizacoes = Object.keys(localizacaoMap);

  useEffect(() => {
    // Dados do usuário logado (sempre do localStorage, nunca mudam)
    setNomeLogado(localStorage.getItem('userNome') || '');
    setEmailLogado(localStorage.getItem('userEmail') || '');
    
    // ID do colaborador logado - busca 'colaboradorId' (que é salvo no login)
    let userId = localStorage.getItem('colaboradorId');
    
    if (userId) {
      setColaboradorId(parseInt(userId));
      // Busca localização atual
      fetchCurrentLocation(userId);
    } else {
      console.error('Não foi possível obter o ID do usuário');
    }

    // Se estiver na rota de detalhes, busca colaborador/cliente pelo id
    if (id) {
      let endpoint = '';
      if (pathname.includes('/colaboradores')) {
        endpoint = `http://localhost:3001/api/colaboradores/${id}`;
      } else if (pathname.includes('/clientes')) {
        endpoint = `http://localhost:3001/api/clientes/${id}`;
      }

      if (endpoint) {
        (async () => {
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(endpoint, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok && data.nome) setNomeEntidade(data.nome);
            else setNomeEntidade('');
          } catch { setNomeEntidade(''); }
        })();
      } else {
        setNomeEntidade('');
      }
    } else {
      setNomeEntidade('');
    }
  }, [id, pathname]);

  // Função para buscar localização atual
  const fetchCurrentLocation = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(`http://localhost:3001/api/localizacoes/colaborador/${userId}/atual`, {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        if (data.tipo_localizacao) {
          // Converte valor da API de volta para exibição
          const displayName = Object.keys(localizacaoMap).find(
            key => localizacaoMap[key] === data.tipo_localizacao
          ) || 'Presencial';
          setLocalizacao(displayName);
        }
      } else {
        // Se não tem localização atual, busca no localStorage ou usa Presencial
        const savedLocation = localStorage.getItem('userLocation') || 'Presencial';
        setLocalizacao(savedLocation);
      }
    } catch (error) {
      console.error('Erro ao buscar localização atual:', error);
      const savedLocation = localStorage.getItem('userLocation') || 'Presencial';
      setLocalizacao(savedLocation);
    }
  };

  // Função para voltar à página anterior
  const handleGoBack = () => {
    router.back();
  };

  // Função para mudar localização
  const handleLocationChange = async (novaLocalizacao) => {
    if (!colaboradorId) {
      console.error('ID do colaborador não encontrado');
      alert('Erro: Não foi possível identificar o usuário. Faça login novamente.');
      return;
    }

    setLocalizacao(novaLocalizacao);
    setShowLocationDropdown(false);
    
    // Salva no localStorage para backup
    localStorage.setItem('userLocation', novaLocalizacao);
    
    try {
      const token = localStorage.getItem('authToken');
      const valorAPI = localizacaoMap[novaLocalizacao];
      
      console.log('Enviando:', { colaborador_id: colaboradorId, tipo_localizacao: valorAPI });
      
      const response = await fetch('http://localhost:3001/api/localizacoes/', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          colaborador_id: colaboradorId,
          tipo_localizacao: valorAPI 
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        console.error('Erro ao salvar localização:', errorData);
        alert('Erro ao salvar localização: ' + (errorData.error || 'Erro desconhecido'));
      } else {
        console.log('Localização salva com sucesso:', novaLocalizacao);
      }
    } catch (error) {
      console.error('Erro ao salvar localização:', error);
      alert('Erro de conexão ao salvar localização');
    }
  };

  // Função para fechar dropdown ao clicar fora
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (showLocationDropdown && !event.target.closest('.locationSelector')) {
        setShowLocationDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showLocationDropdown]);

  // Título lado esquerdo: nome do colaborador/cliente (se detalhes), senão nome formatado da rota
  const lastSegment = pathname.split('/').pop();
  const prettyTitle =
    lastSegment
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/^./, match => match.toUpperCase());

  const pageTitle = (id && nomeEntidade) ? nomeEntidade : prettyTitle || 'Dashboard';

  // Verificar se não está na página inicial para mostrar botão voltar
  const showBackButton = pathname !== '/' && pathname !== '/dashboard';

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {showBackButton && (
          <button onClick={handleGoBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
        )}
        <div className={styles.title}>{pageTitle}</div>
      </div>

      <div className={styles.rightSection}>
        {/* Seletor de Localização */}
        <div className={`${styles.locationSelector} locationSelector`}>
          <button 
            onClick={() => setShowLocationDropdown(!showLocationDropdown)}
            className={styles.locationButton}
          >
            <span>{localizacao}</span>
            <ChevronDown 
              size={16} 
              className={`${styles.locationIcon} ${showLocationDropdown ? styles.locationIconOpen : ''}`} 
            />
          </button>
          
          {showLocationDropdown && (
            <div className={styles.locationDropdown}>
              {localizacoes.map((loc) => (
                <button
                  key={loc}
                  onClick={() => handleLocationChange(loc)}
                  className={`${styles.locationOption} ${
                    loc === localizacao ? styles.locationActive : ''
                  }`}
                >
                  {loc}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Perfil do usuário */}
        <div className={styles.perfil}>
          <Bell size={22} className={styles.icon} />
          <div className={styles.perfilInfo}>
            <p className={styles.perfilName}>{nomeLogado}</p>
            <span className={styles.perfilEmail}>{emailLogado}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
