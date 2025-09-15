'use client'
import styles from './header.module.css'
import {Bell} from 'lucide-react'
import { usePathname } from 'next/navigation';

export function Header({user}){

    const pathname = usePathname()
    const pageTitle = pathname.split('/').pop().replace('-', ' ') || 'Dashboard';

    const userName = user?.name || 'Usuário'
    const userEmail = user?.email || 'usuario@email.com'


    return(
        <header className={styles.header}>

            <div className={styles.title}>{pageTitle}</div>
            <div>
            <div className={styles.perfil}>
                <Bell size={22} className={styles.icon}></Bell>

                <div className={styles.perfilInfo} >
                <p className={styles.perfilName}>{userName}</p>
                <span className={styles.perfilEmail}>{userEmail}</span>
                </div>
                </div>
            </div>


        </header>
    )
}