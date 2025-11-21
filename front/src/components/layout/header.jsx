'use client';

import styles from './header.module.css';
import { Bell, ArrowLeft, ChevronDown, Menu, X, LogOut } from 'lucide-react';
import { usePathname, useParams, useRouter } from 'next/navigation';
import { getApiUrl } from '@/lib/apiConfig';
import React, { useEffect, useState } from 'react';
import { useSidebar } from '@/hooks/useSidebar';

export function Header() {
  const pathname = usePathname();
  const params = useParams();
  const router = useRouter();
  const id = params?.id;
  const { sidebarOpen, toggleSidebar } = useSidebar();
  const [isMobile, setIsMobile] = useState(false);

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth <= 768);
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  }, []);

  const [nomeLogado, setNomeLogado] = useState('');
  const [emailLogado, setEmailLogado] = useState('');
  const [colaboradorId, setColaboradorId] = useState(null);
  const [nomeEntidade, setNomeEntidade] = useState('');
  const [localizacao, setLocalizacao] = useState('Presencial');
  const [showLocationDropdown, setShowLocationDropdown] = useState(false);

  const localizacaoMap = {
    'Presencial': 'Presencial',
    'Home Office': 'Home Office', 
    'Evento': 'Evento',
    'Treinamento': 'Treinamento'
  };

  const localizacoes = Object.keys(localizacaoMap);

  useEffect(() => {
    setNomeLogado(localStorage.getItem('userNome') || 'Não logado');
    setEmailLogado(localStorage.getItem('userEmail') || 'Não logado');
    let userId = localStorage.getItem('colaboradorId');
    if (userId) {
      setColaboradorId(parseInt(userId));
      fetchCurrentLocation(userId);
    }
    if (id) {
      let endpoint = '';
      let fieldName = 'nome';
      if (pathname.includes('/colaboradores')) {
        endpoint = getApiUrl(`colaboradores/${id}`);
      } else if (pathname.includes('/clientes')) {
        endpoint = getApiUrl(`clientes/${id}`);
      } else if (pathname.includes('/eventos')) {
        endpoint = getApiUrl(`eventos/${id}`);
        fieldName = 'titulo';
      } else if (pathname.includes('/cotacoes')) {
        setNomeEntidade('Cotações');
        return;
      }
      if (endpoint) {
        (async () => {
          try {
            const token = localStorage.getItem('authToken');
            const response = await fetch(endpoint, {
              headers: { 'Authorization': `Bearer ${token}` },
            });
            const data = await response.json();
            if (response.ok && data[fieldName]) setNomeEntidade(data[fieldName]);
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

  const fetchCurrentLocation = async (userId) => {
    try {
      const token = localStorage.getItem('authToken');
      const response = await fetch(getApiUrl(`localizacoes/colaborador/${userId}/atual`), {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      });
      if (response.ok) {
        const data = await response.json();
        if (data.tipo_localizacao) {
          const displayName = Object.keys(localizacaoMap).find(
            key => localizacaoMap[key] === data.tipo_localizacao
          ) || 'Presencial';
          setLocalizacao(displayName);
        }
      } else {
        const savedLocation = localStorage.getItem('userLocation') || 'Presencial';
        setLocalizacao(savedLocation);
      }
    } catch (error) {
      const savedLocation = localStorage.getItem('userLocation') || 'Presencial';
      setLocalizacao(savedLocation);
    }
  };

  const handleGoBack = () => {
    router.back();
  };

  const handleLocationChange = async (novaLocalizacao) => {
    if (!colaboradorId) {
      alert('Erro: Não foi possível identificar o usuário. Faça login novamente.');
      return;
    }
    setLocalizacao(novaLocalizacao);
    setShowLocationDropdown(false);
    localStorage.setItem('userLocation', novaLocalizacao);
    try {
      const token = localStorage.getItem('authToken');
      const valorAPI = localizacaoMap[novaLocalizacao];
      await fetch(getApiUrl('localizacoes/'), {
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
    } catch {}
  };

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

  const lastSegment = pathname.split('/').pop();
  let prettyTitle =
    lastSegment
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/^./, match => match.toUpperCase());

  const specialNames = {
    'cotacoes': 'Cotações',
    'clientes': 'Clientes',
    'colaboradores': 'Colaboradores',
    'eventos': 'Eventos',
    'agregados': 'Agregados'
  };

  if (specialNames[lastSegment]) {
    prettyTitle = specialNames[lastSegment];
  }

  const pageTitle = (id && nomeEntidade) ? nomeEntidade : prettyTitle || 'Dashboard';
  const showBackButton = pathname !== '/' && pathname !== '/dashboard';

  function handleLogout() {
    if (window.confirm('Deseja realmente sair?')) {
      localStorage.clear();
      router.replace('/login');
    }
  }

  return (
    <header className={styles.header}>
      <div className={styles.leftSection}>
        {isMobile && (
          <button 
            onClick={toggleSidebar}
            className={styles.hamburgerButton}
            aria-label="Toggle sidebar"
          >
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </button>
        )}
        {showBackButton && (
          <button onClick={handleGoBack} className={styles.backButton}>
            <ArrowLeft size={20} />
          </button>
        )}
        <div className={styles.title}>{pageTitle}</div>
      </div>

      <div className={styles.rightSection}>
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

        <div className={styles.perfil}>
          <div className={styles.perfilInfo}>
            <p className={styles.perfilName}>{nomeLogado}</p>
            <span className={styles.perfilEmail}>{emailLogado}</span>
          </div>
          <button
            type="button"
            className={styles.icon}
            onClick={handleLogout}
            title="Sair"
            aria-label="Sair"
          >
            <LogOut size={22} />
          </button>
        </div>
      </div>
    </header>
  );
}
