'use client';
import Link from 'next/link';
import styles from './sidebar.module.css';
import { ClipboardList,Car, ListChecks, Cog, MapPinned, Users, LayoutDashboard, Building, Briefcase, BarChart2, FileText, Settings, CalendarCheck, NotepadText, Calculator, DollarSign, Table } from 'lucide-react';
import { useState, useEffect } from 'react';
import { usePathname } from 'next/navigation';

export function Sidebar() {
  const [openMenu, setOpenMenu] = useState(null)
  const pathname = usePathname()
  const [mounted, setMounted] = useState(false);

  const [permissao, setPermissao] = useState(null);

  useEffect(() => {
    const storedPermissao = localStorage.getItem('nivelPermissao');
    setPermissao(storedPermissao);

  }, []);

  useEffect(() => {
    setMounted(true);
    const savedMenu = localStorage.getItem('openMenu');
    if (savedMenu) {
      setOpenMenu(savedMenu);
    }
  }, []);

  const toggleMenu = (menuName) => {
    const newMenu = openMenu === menuName ? null : menuName;
    setOpenMenu(newMenu);

    if (newMenu) {
      localStorage.setItem('openMenu', newMenu);
    } else {
      localStorage.removeItem('openMenu');
    }
  };

  if (!mounted) {
    return null;
  }

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.logo}>Newe</h1>
      <ul className={styles.navList}>

        {/* <li className={styles.navItem}>
          <Link href="/dashboard"><LayoutDashboard size={20} /> Dashboard</Link>
        </li> */}

        {/* MENU DE EVENTOS*/}
        <li className={styles.navItem}>
          <Link href="/eventos"
            className={pathname === '/eventos' ? styles.activeLink : ''}>
            <CalendarCheck size={16} /> Eventos</Link>
        </li>
        

        {/* SUBMENU ADMINISTRATIVO  */}
        {(permissao === 'Administrador' || permissao ==='Gerente') && 
        <li className={styles.navItem}>
          <button onClick={() => toggleMenu('administrativo')}
            className={pathname.startsWith('/administrativo') ? styles.activeLink : ''}>
            <Building size={20} /> Administrativo
          </button>
          {openMenu === 'administrativo' && (
            <ul className={styles.submenu}>
              <li className={styles.navItem}>
                <Link href="/administrativo/colaboradores"
                  className={pathname === '/administrativo/colaboradores' ? styles.activeLink : ''}>
                  <Users size={16} /> Colaboradores</Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/administrativo/painelLocalizacao"
                  className={pathname === '/administrativo/painelLocalizacao' ? styles.activeLink : ''}>
                  <MapPinned size={16} /> Painel Localização</Link>
              </li>

              <li className={styles.navItem}>
                <Link href="/administrativo/eventos"
                  className={pathname === '/administrativo/eventos' ? styles.activeLink : ''}>
                  <CalendarCheck size={16} /> Eventos</Link>
              </li>
            </ul>
          )}
        </li>}

        {/* SUBMENU COMERCIAL  */}
        
        {(['Comercial', 'Gerente','Administrador'].includes(permissao))  && 
        <li className={styles.navItem}>
          <button onClick={() => toggleMenu('comercial')}
            className={pathname.startsWith('/comercial') ? styles.activeLink : ''}>
            <Briefcase size={20} /> Comercial
          </button>
          {openMenu === 'comercial' && (
            <ul className={styles.submenu}>

              <li className={styles.navItem}>
                <Link href="/comercial/clientes"
                  className={pathname === '/comercial/clientes' ? styles.activeLink : ''}>
                  <BarChart2 size={16} /> Clientes
                </Link>
              </li>

              <li className={styles.navItem}>
                <Link href="/comercial/cotacoes"
                  className={pathname.startsWith('/comercial/cotacoes') ? styles.activeLink : ''}>
                  <Calculator size={16} /> Cotações
                </Link>
              </li>

              <li className={styles.navItem}>
                <Link href="/comercial/cotacoes/generalidades"
                  className={pathname === '/comercial/cotacoes/generalidades' ? styles.activeLink : ''}>
                  <DollarSign size={16} /> Generalidades
                </Link>
              </li>

              <li className={styles.navItem}>
                <Link href="/comercial/cotacoes/tabelas"
                  className={pathname === '/comercial/cotacoes/tabelas' ? styles.activeLink : ''}>
                  <Table size={16} /> Tabelas de Preços
                </Link>
              </li>

              {/* <li className={styles.navItem}>
              <Link
               href="/comercial/vendas"
               className={pathname === '/comercial/vendas' ? styles.activeLink : ''}>
                <FileText size={16} /> Vendas
              </Link>
            </li> */}
              <li className={styles.navItem}>
                <Link href="/comercial/acompanhamento"
                  className={pathname === '/comercial/acompanhamento' ? styles.activeLink : ''}>
                  <NotepadText size={16} /> Acompanhamento
                </Link>
              </li>

            </ul>
          )}
        </li>}

        {/* SUBMENU OPERACIONAL  */}
        {(['Operador','Motorista', 'Gerente','Administrador'].includes(permissao))  && 
        <li className={styles.navItem}>
          <button onClick={() => toggleMenu('operacional')}
            className={pathname.startsWith('/operacional') ? styles.activeLink : ''}>
            <Settings size={20} /> Operacional
          </button>
          {openMenu === 'operacional' && (
            <ul className={styles.submenu}>
              <li className={styles.navItem}>
                <Link href="/operacional/fretes"
                  className={pathname === '/operacional/fretes' ? styles.activeLink : ''}>
                  <Car size={16} /> Fretes
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/operacional/agregados"
                  className={pathname === '/operacional/agregados' ? styles.activeLink : ''}>
                  <ClipboardList size={16} /> Histórico Formulários
                </Link>
              </li>
              <li className={styles.navItem}>
                <Link href="/operacional/checklist"
                  className={pathname === '/operacional/checklist' ? styles.activeLink : ''}>
                  <ListChecks size={16} /> Preencher Checklist
                </Link>
              </li>
            </ul>
          )}
        </li>}


      </ul>
    </aside>
  );
}
