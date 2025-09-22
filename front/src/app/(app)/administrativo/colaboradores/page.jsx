'use client';
import { useState, useMemo } from "react";
import { Button, ButtonEstatico } from "@/components/ui/button";
import { ColaboradorTable } from "@/features/administrativo/colaboradorTable";
import { CardContent } from "@/components/ui/card";
import { testeColaboradores } from "./listaColaboradores";
import styles from "./colaborador.module.css"
import { UserRoundPlus } from "lucide-react";
import Link from "next/link";


          
export default function PaginaRH() {

  const [sortConfig, setSortConfig] = useState ({key: 'nome', direction: 'ascending'})

  const sortedColaboradores = useMemo (() => {
    let sortableItems = [...testeColaboradores]
    if(sortConfig !== null) {
      sortableItems.sort((a,b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction ==='ascending' ? -1 :1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction ==='ascending' ? 1 : -1
        }
        return 0;
      })
    }
    return sortableItems
  }, [testeColaboradores, sortConfig])
  const requestSort = (key) => {
    let direction = 'ascending'
    //se a coluna ja esta clicada inverte a ordem
    if (sortConfig.key == key && sortConfig.direction === 'ascending'){
      direction = 'descending'
    }
    setSortConfig({key, direction})
  }
  return (
    <div>
      
      <CardContent>
        <header className={styles.header}>
          <Link href="/administrativo/colaboradores/novo">
            <Button variant="add"><UserRoundPlus size={20}/>  Adicionar</Button>
          </Link>
        </header>
      <ColaboradorTable colaboradores={sortedColaboradores}
        requestSort={requestSort}
        sortConfig = {sortConfig}></ColaboradorTable>
      </CardContent>
    </div>
  );
}