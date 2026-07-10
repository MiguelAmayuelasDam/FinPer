import { useCallback, useEffect, useMemo, useState } from "react"
import { Link } from "react-router-dom"
import { Search } from "lucide-react"

import { TransactionForm } from "@/components/TransactionForm"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useAuth } from "@/context/AuthContext"
import {
  ApiError,
  api,
  type Category,
  type Transaction,
  type TransactionFilters,
  type TransactionInput,
} from "@/lib/api"
import { formatDateHeader, formatSignedAmount, groupByDate } from "@/lib/format"

type Tab = "all" | "expense" | "income" | "transfer"

const TABS: { key: Tab; label: string }[] = [
  { key: "all", label: "Todos" },
  { key: "expense", label: "Gastos" },
  { key: "income", label: "Ingresos" },
  { key: "transfer", label: "No computable" },
]

const ALL_CATEGORIES = "all"

function amountClass(type: Transaction["type"]): string {
  if (type === "income") return "text-green-600"
  if (type === "transfer") return "text-muted-foreground"
  return "text-foreground"
}

export default function Transactions() {
  const { logout } = useAuth()
  const [categories, setCategories] = useState<Category[]>([])
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)

  // Filtros de servidor (fecha y categoría).
  const [dateFrom, setDateFrom] = useState("")
  const [dateTo, setDateTo] = useState("")
  const [categoryId, setCategoryId] = useState(ALL_CATEGORIES)
  // Filtros de cliente (pestaña por tipo y buscador por concepto).
  const [tab, setTab] = useState<Tab>("all")
  const [search, setSearch] = useState("")

  // Diálogo de alta/edición.
  const [dialogOpen, setDialogOpen] = useState(false)
  const [editing, setEditing] = useState<Transaction | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [formError, setFormError] = useState<string | null>(null)

  useEffect(() => {
    api.categories.list().then(setCategories).catch(() => setCategories([]))
  }, [])

  const loadTransactions = useCallback(async () => {
    const filters: TransactionFilters = {}
    if (dateFrom) filters.from = dateFrom
    if (dateTo) filters.to = dateTo
    if (categoryId !== ALL_CATEGORIES) filters.category_id = categoryId
    setTransactions(await api.transactions.list(filters))
  }, [dateFrom, dateTo, categoryId])

  useEffect(() => {
    setLoading(true)
    loadTransactions().finally(() => setLoading(false))
  }, [loadTransactions])

  const groups = useMemo(() => {
    const term = search.trim().toLowerCase()
    const visible = transactions.filter((t) => {
      if (tab !== "all" && t.type !== tab) return false
      if (term && !t.concept.toLowerCase().includes(term)) return false
      return true
    })
    return groupByDate(visible)
  }, [transactions, tab, search])

  const openCreate = () => {
    setEditing(null)
    setFormError(null)
    setDialogOpen(true)
  }

  const openEdit = (t: Transaction) => {
    setEditing(t)
    setFormError(null)
    setDialogOpen(true)
  }

  const handleSubmit = async (input: TransactionInput) => {
    setSubmitting(true)
    setFormError(null)
    try {
      if (editing) {
        await api.transactions.update(editing.id, input)
      } else {
        await api.transactions.create(input)
      }
      setDialogOpen(false)
      await loadTransactions()
    } catch (err) {
      setFormError(err instanceof ApiError ? err.message : "No se pudo guardar el movimiento")
    } finally {
      setSubmitting(false)
    }
  }

  const handleDelete = async () => {
    if (!editing) return
    if (!window.confirm(`¿Borrar el movimiento "${editing.concept}"?`)) return
    await api.transactions.remove(editing.id)
    setDialogOpen(false)
    await loadTransactions()
  }

  return (
    <main className="mx-auto max-w-4xl p-4 sm:p-8">
      <header className="mb-6 flex items-center justify-between">
        <h1 className="text-3xl font-bold">Movimientos</h1>
        <div className="flex items-center gap-2">
          <Button variant="ghost" asChild>
            <Link to="/">Inicio</Link>
          </Button>
          <Button variant="outline" onClick={() => void logout()}>
            Cerrar sesión
          </Button>
        </div>
      </header>

      {/* Filtros: fechas, categoría y buscador */}
      <div className="mb-4 flex flex-wrap items-end gap-3">
        <div className="flex items-end gap-2">
          <div className="space-y-1">
            <Label htmlFor="from" className="text-xs text-muted-foreground">
              Fechas
            </Label>
            <Input
              id="from"
              type="date"
              aria-label="Fecha de inicio"
              value={dateFrom}
              onChange={(e) => setDateFrom(e.target.value)}
              className="w-40"
            />
          </div>
          <span className="pb-2 text-muted-foreground">a</span>
          <Input
            id="to"
            type="date"
            aria-label="Fecha de fin"
            value={dateTo}
            onChange={(e) => setDateTo(e.target.value)}
            className="w-40"
          />
        </div>

        <div className="min-w-52 flex-1 space-y-1">
          <Label htmlFor="category-filter" className="text-xs text-muted-foreground">
            Categoría
          </Label>
          <Select value={categoryId} onValueChange={setCategoryId}>
            <SelectTrigger id="category-filter" aria-label="Filtrar por categoría">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL_CATEGORIES}>Todas las categorías</SelectItem>
              {categories.map((c) => (
                <SelectItem key={c.id} value={c.id}>
                  {c.emoji ? `${c.emoji} ` : ""}
                  {c.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="relative min-w-52 flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            type="search"
            placeholder="Buscar por concepto"
            aria-label="Buscar"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {/* Pestañas por tipo + botón de alta */}
      <div className="mb-2 flex items-center justify-between border-b">
        <div className="flex gap-1">
          {TABS.map((t) => (
            <button
              key={t.key}
              type="button"
              onClick={() => setTab(t.key)}
              className={
                "border-b-2 px-3 py-2 text-sm font-medium transition-colors " +
                (tab === t.key
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground")
              }
            >
              {t.label}
            </button>
          ))}
        </div>
        <Button size="sm" onClick={openCreate}>
          Añadir movimiento
        </Button>
      </div>

      {/* Listado agrupado por fecha */}
      {loading ? (
        <p className="py-8 text-center text-muted-foreground">Cargando…</p>
      ) : groups.length === 0 ? (
        <p className="rounded-md border border-dashed p-8 text-center text-muted-foreground">
          No hay movimientos que mostrar.
        </p>
      ) : (
        <div>
          {groups.map((group) => (
            <section key={group.date}>
              <h2 className="bg-muted/50 px-3 py-1.5 text-xs font-medium text-muted-foreground">
                {formatDateHeader(group.date)}
              </h2>
              <ul>
                {group.items.map((t) => (
                  <li key={t.id}>
                    <button
                      type="button"
                      onClick={() => openEdit(t)}
                      data-testid="transaction-row"
                      className="flex w-full items-center gap-3 border-b px-3 py-3 text-left transition-colors hover:bg-muted/40"
                    >
                      <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-muted text-lg">
                        {t.category?.emoji ?? "🏷️"}
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-semibold text-foreground">
                          {t.concept}
                        </span>
                        <span className="block truncate text-sm text-muted-foreground">
                          {t.category?.name ?? "Sin categoría"}
                        </span>
                      </span>
                      <span className={"shrink-0 font-semibold " + amountClass(t.type)}>
                        {formatSignedAmount(t)}
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ))}
        </div>
      )}

      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{editing ? "Editar movimiento" : "Nuevo movimiento"}</DialogTitle>
            <DialogDescription>Registra una entrada o salida de dinero.</DialogDescription>
          </DialogHeader>
          <TransactionForm
            key={editing?.id ?? "new"}
            categories={categories}
            initial={editing ?? undefined}
            submitting={submitting}
            error={formError}
            onSubmit={handleSubmit}
          />
          {editing ? (
            <Button
              variant="ghost"
              className="w-full text-destructive hover:text-destructive"
              onClick={() => void handleDelete()}
            >
              Borrar movimiento
            </Button>
          ) : null}
        </DialogContent>
      </Dialog>
    </main>
  )
}
