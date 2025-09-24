'use client';
import { useState, useEffect, useMemo } from "react";
import { Button, ButtonEstatico } from "@/components/ui/button";
import { ColaboradorTable } from "@/features/administrativo/colaboradorTable";
import { CardContent } from "@/components/ui/card";
import styles from "./colaborador.module.css"
import { UserRoundPlus } from "lucide-react";
import Link from "next/link";


          
export default function PaginaRH() {
  const [colaboradores, setColaboradores] = useState([]);

  const [sortConfig, setSortConfig] = useState ({key: 'nome', direction: 'ascending'})

  useEffect(() => {
    async function fetchColaboradores() {
      try {
        const token = localStorage.getItem('authToken');
        const response = await fetch("http://localhost:3001/api/colaboradores", {
          headers: {
            "Authorization": `Bearer ${token}`,
          },
        });
        const data = await response.json();

        if (response.ok) {
          setColaboradores(data);
        } else {
          console.error("Erro ao carregar colaboradores:", data.message);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      }
    }

    fetchColaboradores();
  }, []);

  const sortedColaboradores = useMemo(() => {
    let sortableItems = [...colaboradores];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === 'ascending' ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [colaboradores, sortConfig]);

  const requestSort = (key) => {
    let direction = 'ascending';
    if (sortConfig.key === key && sortConfig.direction === 'ascending') {
      direction = 'descending';
    }
    setSortConfig({ key, direction });
  };

  return (
    <div>
      <CardContent>
        <header className={styles.header}>
          <Link href="/administrativo/colaboradores/novo">
            <Button variant="add"><UserRoundPlus size={20}/>  Adicionar</Button>
          </Link>
        </header>
        <ColaboradorTable 
          colaboradores={sortedColaboradores}
          requestSort={requestSort}
          sortConfig={sortConfig}
        />
      </CardContent>
    </div>
  );
}