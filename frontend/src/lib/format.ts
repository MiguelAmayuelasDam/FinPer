import type { Transaction } from "@/lib/api"

const moneyFmt = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Importe con signo según el tipo: −gasto, +ingreso, sin signo si no computable.
export function formatSignedAmount(t: Transaction): string {
  const value = moneyFmt.format(Number(t.amount))
  if (t.type === "expense") return `−${value} €`
  if (t.type === "income") return `+${value} €`
  return `${value} €`
}

const dateHeaderFmt = new Intl.DateTimeFormat("es-ES", {
  weekday: "long",
  day: "numeric",
  month: "short",
  year: "numeric",
})

// "MIÉRCOLES 8 JUL. 2026" a partir de "2026-07-08".
export function formatDateHeader(isoDate: string): string {
  const [y, m, d] = isoDate.split("-").map(Number)
  const date = new Date(y, m - 1, d)
  return dateHeaderFmt.format(date).toUpperCase()
}

export interface DateGroup {
  date: string
  items: Transaction[]
}

// Agrupa por fecha manteniendo el orden (la API ya devuelve reciente→antiguo).
export function groupByDate(transactions: Transaction[]): DateGroup[] {
  const groups: DateGroup[] = []
  for (const t of transactions) {
    const last = groups[groups.length - 1]
    if (last && last.date === t.occurred_on) {
      last.items.push(t)
    } else {
      groups.push({ date: t.occurred_on, items: [t] })
    }
  }
  return groups
}
