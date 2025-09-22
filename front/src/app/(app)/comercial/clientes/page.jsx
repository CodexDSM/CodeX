'use client'

import { useState, useMemo } from "react"
import { ClienteTable } from "@/features/comercial/clientesTable"   // nome do componente em PascalCase
import { CardContent } from "@/components/ui/card"
import { testeClientes } from "./[id]/listaClientes"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { UserRoundPlus } from "lucide-react";
import styles from "./cliente.module.css"

export default function PaginaClientes() {
  const [sortConfig, setSortConfig] = useState({ key: "nome", direction: "ascending" })

  const sortedClientes = useMemo(() => {
    let sortableItems = [...testeClientes]

    if (sortConfig !== null) {
      sortableItems.sort((a, b) => {
        if (a[sortConfig.key] < b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? -1 : 1
        }
        if (a[sortConfig.key] > b[sortConfig.key]) {
          return sortConfig.direction === "ascending" ? 1 : -1
        }
        return 0
      })
    }

    return sortableItems
  }, [sortConfig]) // não precisa de testeClientes aqui, já é importado fixo

  const requestSort = (key) => {
    let direction = "ascending"
    if (sortConfig.key === key && sortConfig.direction === "ascending") {
      direction = "descending"
    }
    setSortConfig({ key, direction })
  }

  return (
    <div>
      <CardContent>

          <header className={styles.header}>
          <Link href="/comercial/clientes/novo">
            <Button variant="add"><UserRoundPlus size={20}/>  Adicionar</Button>
          </Link>

        </header>


        <ClienteTable
          clientes={sortedClientes}
          requestSort={requestSort}
          sortConfig={sortConfig}
        />
      </CardContent>
    </div>
  )
}
