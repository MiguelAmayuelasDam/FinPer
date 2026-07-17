import type { Bucket, Transaction, TransactionType } from "@/lib/api"

// Color y etiqueta por cubo 50-30-20 (para el punto de color de cada categoría).
// `label` lleva el porcentaje por defecto y solo vale donde se explica la regla;
// `short` es el nombre a secas, para cabeceras y sitios donde el porcentaje del
// usuario puede no ser el de fábrica (son configurables).
// El punto dice **cuál** es el cubo, nunca **qué tal** va: eso lo dice el
// semáforo. Por eso ninguno de los tres cubos del 50-30-20 usa verde, ámbar ni
// rojo, que son del estado. Antes Vida iba de verde (= "vas bien") y Mes de
// ámbar (= "ojo"), así que en Análisis el punto y la barra decían lo mismo con
// el mismo color; y en oscuro Ingresos (--primary) e Inversión eran el mismo
// color para un protanope (ΔE 0,7). Tonos elegidos con validador, no a ojo.
export const BUCKET_META: Record<Bucket, { label: string; short: string; dot: string }> = {
  living: { label: "Vida (50%)", short: "Vida", dot: "bg-bucket-living" },
  monthly: { label: "Mes (30%)", short: "Mes", dot: "bg-bucket-monthly" },
  investment: { label: "Inversión (20%)", short: "Inversión", dot: "bg-invest" },
  // Ingresos sí va de verde: no es un cubo del reparto, no compite con ningún
  // semáforo, y es el mismo verde con el que se pinta el importe de un ingreso.
  income: { label: "Ingresos", short: "Ingresos", dot: "bg-income" },
  transfer: { label: "No computable", short: "No computable", dot: "bg-bucket-transfer" },
}

// Orden en el que se presentan los cubos al usuario: primero los tres del
// 50-30-20 (que es de lo que va la app) y después ingresos y no computables.
// Alfabéticamente saldría "income, investment, living…", que no significa nada.
export const BUCKET_ORDER: Bucket[] = ["living", "monthly", "investment", "income", "transfer"]

/** Agrupa categorías por cubo, en el orden de `BUCKET_ORDER`, sin grupos vacíos. */
export function groupByBucket<T extends { bucket: Bucket }>(items: T[]): [Bucket, T[]][] {
  return BUCKET_ORDER.map((bucket): [Bucket, T[]] => [
    bucket,
    items.filter((item) => item.bucket === bucket),
  ]).filter(([, group]) => group.length > 0)
}

/**
 * Escalera de tamaños para un importe destacado: de mayor a menor.
 * Cada sitio define la suya según el hueco que tiene.
 */
export type AmountSizes = readonly [big: string, mid: string, small: string]

/**
 * Tamaño de fuente para un importe **ya formateado**, según lo largo que sea.
 *
 * Los importes llegan hasta `9.999.999,00 €` (14 caracteres) y a tamaño fijo no
 * caben en su hueco: en el donut la cifra se comía el anillo, y en Análisis las
 * tres cifras se tocaban entre sí.
 *
 * Se escala por **longitud del texto** y no con `clamp()` ni container queries
 * porque lo que desborda no es el ancho del contenedor —que es fijo— sino el
 * número de caracteres.
 *
 * Los cortes están **medidos** sobre Archivo bold con `tabular-nums` (todos los
 * dígitos ocupan lo mismo), no estimados. Anchos en px:
 *
 * ```
 *                    len   4xl   3xl   2xl    xl
 *  1.234,56 €         10   174   145   116    97
 *  123.456,78 €       12   216   180   144   120
 *  9.999.999,00 €     14   246   205   164   137
 *  −9.999.999,00 €    15   272   226   181   151
 * ```
 *
 * Los huecos más estrechos que hay que respetar son 172 px (centro del donut) y
 * ~181 px (columna de Análisis con la ventana en el mínimo de `sm:grid-cols-3`).
 * De ahí los cortes en 10 y 12: con el corte en 13, un `123.456,78 €` a `3xl`
 * (180 px) se comía la columna por los pelos.
 */
export function amountSizeClass(formatted: string, sizes: AmountSizes): string {
  const len = formatted.length
  if (len <= 10) return sizes[0] // "1.234,56 €"     — el día a día
  if (len <= 12) return sizes[1] // "123.456,78 €"   — miles largos
  return sizes[2] //               "9.999.999,00 €"  — millones (los que desbordaban)
}

// Fecha de hoy en formato ISO (YYYY-MM-DD), para limitar los selectores de fecha.
export function todayISO(): string {
  return new Date().toISOString().slice(0, 10)
}

// Días transcurridos del periodo [from, to] hasta hoy (mínimo 1). Sirve para
// medias por día y proyecciones (no cuenta días futuros del periodo).
export function daysElapsed(from: string, to: string): number {
  const f = new Date(`${from}T00:00:00`)
  const t = new Date(`${to}T00:00:00`)
  const today = new Date()
  today.setHours(0, 0, 0, 0)
  const end = today < t ? today : t
  return Math.max(1, Math.floor((end.getTime() - f.getTime()) / 86_400_000) + 1)
}

const moneyFmt = new Intl.NumberFormat("es-ES", {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

// Importe formateado en es-ES sin signo (p. ej. "1.000,00 €").
export function formatMoney(amount: string | number): string {
  return `${moneyFmt.format(Number(amount))} €`
}

// Importe con signo según el tipo: −gasto, +ingreso, sin signo si no computable.
export function signedAmount(amount: string, type: TransactionType): string {
  const value = moneyFmt.format(Number(amount))
  if (type === "expense") return `−${value} €`
  if (type === "income") return `+${value} €`
  return `${value} €`
}

export function formatSignedAmount(t: Transaction): string {
  return signedAmount(t.amount, t.type)
}

export function amountClass(type: TransactionType): string {
  if (type === "income") return "text-income"
  if (type === "transfer") return "text-muted-foreground"
  return "text-foreground"
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
