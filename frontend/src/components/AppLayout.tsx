import { Outlet } from "react-router-dom"

import { TopNav } from "@/components/TopNav"

// Layout de las páginas autenticadas: barra superior constante + contenido.
export function AppLayout() {
  return (
    <>
      <TopNav />
      <Outlet />
    </>
  )
}
