          
"use client";
import { useState, useEffect, useMemo } from "react";
import { ClienteTable } from "@/features/comercial/clientesTable";
import { CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { UserRoundPlus } from "lucide-react";
import styles from "./cliente.module.css";

export default function PaginaClientes() {
  const [clientes, setClientes] = useState([]);
  const [sortConfig, setSortConfig] = useState({ key: "nome", direction: "ascending" });

  useEffect(() => {
    async function fetchClientes() {
      try {
        const token = localStorage.getItem("authToken");
        const response = await fetch("http://localhost:3001/api/clientes", { // ajuste a rota conforme sua API
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();
        if (response.ok) {
          setClientes(data);
        } else {
          console.error("Erro ao carregar clientes:", data.message);
        }
      } catch (err) {
        console.error("Erro de rede:", err);
      }
    }
    fetchClientes();
  }, []);

  const sortedClientes = useMemo(() => {
    let sortableItems = [...clientes];
    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1;
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1;
        }
        return 0;
      });
    }
    return sortableItems;
  }, [clientes, sortConfig]);

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
        <Link href="/comercial/clientes/novo">
          <Button variant="add"><UserRoundPlus size={20}/>  Adicionar</Button>
        </Link>
      </header>
      <ClienteTable
        clientes={sortedClientes}
        onSort={requestSort}
        sortConfig={sortConfig}
      />
    </CardContent>
  );
}
