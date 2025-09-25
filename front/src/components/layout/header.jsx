'use client';

import styles from './header.module.css';
import { Bell } from 'lucide-react';
import { usePathname, useParams } from 'next/navigation';
import React, { useEffect, useState } from 'react';

export function Header() {
  const pathname = usePathname();
  const params = useParams();
  const id = params?.id;

  // Dados SEMPRE do usuário logado (lado direito, nunca mudam)
  const [nomeLogado, setNomeLogado] = useState('');
  const [emailLogado, setEmailLogado] = useState('');

  // Nome do colaborador/cliente acessado (detalhe, lado ESQUERDO)
  const [nomeEntidade, setNomeEntidade] = useState('');

  useEffect(() => {
    // Dados do usuário logado (sempre do localStorage, nunca mudam)
    setNomeLogado(localStorage.getItem('userNome') || '');
    setEmailLogado(localStorage.getItem('userEmail') || '');

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

  // Título lado esquerdo: nome do colaborador/cliente (se detalhes), senão nome formatado da rota
  const lastSegment = pathname.split('/').pop();
  const prettyTitle =
    lastSegment
      .replace(/([a-z])([A-Z])/g, '$1 $2')
      .replace(/[-_]/g, ' ')
      .replace(/^./, match => match.toUpperCase());

  const pageTitle = (id && nomeEntidade) ? nomeEntidade : prettyTitle || 'Dashboard';

   return(
        <header className={styles.header}>

            <div className={styles.title}>{pageTitle}</div>
            <div>
            <div className={styles.perfil}>
                <Bell size={22} className={styles.icon}></Bell>

                <div className={styles.perfilInfo} >
                <p className={styles.perfilName}>{nomeLogado}</p>
                <span className={styles.perfilEmail}>{emailLogado}</span>
                </div>
                </div>
            </div>
        </header>
    )
}
