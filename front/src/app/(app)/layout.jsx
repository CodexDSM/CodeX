
import { Sidebar } from '@/components/layout/sidebar';
import { Header } from '@/components/layout/header'; 
import styles from './layout.module.css';
import { SidebarProvider } from '@/hooks/useSidebar';

export default function AppLayout({ children }) {
  return (

    <div className={styles.appContainer}>
    <SidebarProvider>
       <Sidebar />
      
      
      <div className={styles.mainArea}>
     <Header />

      <main className={styles.mainContent}>

        {children}
        
      </main>
      </div>
    </SidebarProvider>
    </div>
  );
}