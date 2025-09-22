'use client';
import Link from 'next/link';
import styles from './sidebar.module.css';
import {ClipboardList,ListChecks,Cog, Users, LayoutDashboard, Building, Briefcase, BarChart2, FileText, Settings } from 'lucide-react';
import { useState } from 'react';
import { usePathname } from 'next/navigation';


export function Sidebar() {
  const [openMenu, setOpenMenu] = useState('comercial')
  const pathname = usePathname()

  const toggleMenu = (menuName) => {
    setOpenMenu(openMenu === menuName ? null : menuName)
  }

  return (
    <aside className={styles.sidebar}>
      <h1 className={styles.logo}>Newe</h1>

      <ul className={styles.navList}>

        <li className={styles.navItem}>
          <Link href="/dashboard"><LayoutDashboard size={20} /> Dashboard</Link>
        </li>

        {/* SUBMENU ADMINISTRATIVO  */}
        <li className={styles.navItem}>
        <button onClick={() => toggleMenu('administrativo')}
          className={pathname.startsWith ('/administrativo') ? styles.activeLink : ''}>
          <Building size={20} /> Administrativo
        </button>
        {openMenu === 'administrativo' && (
        <ul className={styles.submenu}>

          <li className={styles.navItem}>
            <Link href="/administrativo/recursos-humanos"
              className= {pathname === '/administrativo/recursos-humanos' ? styles.activeLink : ''}>
              <Users size={16} /> Recursos Humanos</Link>
          </li>
        </ul>
        )}
        </li>



        {/* SUBMENU COMERCIAL  */}
        <li className={styles.navItem}>
          <button onClick={() => toggleMenu('comercial')}
            className={pathname.startsWith ('/comercial') ? styles.activeLink : ''}>
            <Briefcase size={20} /> Comercial
          </button>
          {openMenu === 'comercial' &&(
          <ul className={styles.submenu}>
            <li className={styles.navItem}>

              <Link href="/comercial/relatorios"
              className={pathname === '/comercial/relatorios' ? styles.activeLink : ''}>
              <BarChart2 size={16} /> Relatórios
              </Link>

            </li>

            <li className={styles.navItem}>
              <Link
               href="/comercial/vendas"
               className={pathname === '/comercial/vendas' ? styles.activeLink : ''}>
                <FileText size={16} /> Vendas
              </Link>
            </li>
          </ul>
          )}
        </li>

        {/* SUBMENU OPERACIONAL  */}
                <li className={styles.navItem}>
        <button onClick={() => toggleMenu('operacional')}
          className={pathname.startsWith ('/operacional') ? styles.activeLink : ''}>
          <Settings size={20} /> Operacional
        </button>
        {openMenu === 'operacional' && (
        <ul className={styles.submenu}>

          <li className={styles.navItem}>
            <Link href="/operacional/formularios"
            className= {pathname === '/operacional/formularios' ? styles.activeLink : ''}>
              <ClipboardList size={16} /> Formulários</Link>
          </li>

          <li className={styles.navItem}>
            <Link href="/operacional/checklist"
            className= {pathname === '/operacional/checklist' ? styles.activeLink : ''}>
              <ListChecks size={16} /> Checklist</Link>
          </li>
        </ul>
        )}
        </li>

      </ul>
    </aside>
  );
}