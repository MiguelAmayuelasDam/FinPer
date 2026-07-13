import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter, Route, Routes, useLocation } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import Dashboard from "@/pages/Dashboard"

function LocationEcho() {
  const loc = useLocation()
  return <div data-testid="loc">{loc.pathname + loc.search}</div>
}

function json(status: number, body: unknown): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

const OVERVIEW = {
  period_label: "julio 2026",
  date_from: "2026-07-01",
  date_to: "2026-07-31",
  is_current: true,
  income_base: "2000.00",
  summary: { income: "2000.00", expense: "1360.00", net: "640.00" },
  buckets: [
    { bucket: "living", label: "Vida", budget: "1000.00", spent: "500.00", pct: 50, status: "ok" },
    { bucket: "monthly", label: "Mes", budget: "600.00", spent: "540.00", pct: 90, status: "warning" },
    { bucket: "investment", label: "Inversión", budget: "400.00", spent: "0.00", pct: 0, status: "ok" },
  ],
  categories: [],
}

const BUDGET = { monthly_income: "2000.00", living_pct: 50, monthly_pct: 30, investment_pct: 20 }

const RECENT = Array.from({ length: 6 }, (_, i) => ({
  label: `M${i}`, year: 2026, month: i + 1, income: "1000.00", expense: "500.00",
}))

const TX = [
  {
    id: "t1", amount: "50.00", type: "expense", concept: "Café con leche",
    occurred_on: "2026-07-10", category: { id: "c1", name: "Restaurante", emoji: "🍕" },
    category_id: "c1", source: "manual", created_at: "2026-07-10T10:00:00Z",
  },
]

const FUND = {
  monthly_need: "2000.00", target_months: 6, target: "12000.00",
  saved: "3000.00", remaining: "9000.00", pct: 25, contributions: [],
}

function installFetch() {
  const fetchMock = vi.fn(async (url: string) => {
    if (url.includes("/analytics/overview")) return json(200, OVERVIEW)
    if (url.includes("/analytics/recent")) return json(200, RECENT)
    if (url.includes("/transactions")) return json(200, TX)
    if (url.includes("/emergency-fund")) return json(200, FUND)
    if (url.includes("/budget")) return json(200, BUDGET)
    return json(404, {})
  })
  vi.stubGlobal("fetch", fetchMock)
  return fetchMock
}

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
  localStorage.clear()
})

describe("Dashboard", () => {
  it("muestra el neto del mes, el colchón y los últimos movimientos", async () => {
    installFetch()
    localStorage.setItem("numario.access", "ACC")
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    await waitFor(() => expect(screen.getByTestId("dash-net")).toHaveTextContent("640,00"))
    // Colchón ahorrado.
    expect(screen.getByText(/3\.?000,00/)).toBeInTheDocument()
    // Último movimiento (size=3).
    expect(screen.getByText("Café con leche")).toBeInTheDocument()
  })

  it("usa un título 50-30-20 dinámico y una tarjeta por cubo", async () => {
    installFetch()
    localStorage.setItem("numario.access", "ACC")
    render(
      <MemoryRouter>
        <Dashboard />
      </MemoryRouter>,
    )
    // Título dinámico según el reparto configurado (50-30-20).
    expect(await screen.findByText("Cómo llevas tu 50-30-20")).toBeInTheDocument()
    // Un mensaje por cubo, con su propia voz.
    expect(screen.getByText("Gastos de vida")).toBeInTheDocument()
    expect(screen.getByText("Gastos del mes")).toBeInTheDocument()
    expect(screen.getByText("Inversión")).toBeInTheDocument()
  })

  it("al pulsar un mes del resumen navega a Análisis con ese mes", async () => {
    installFetch()
    const user = userEvent.setup()
    localStorage.setItem("numario.access", "ACC")
    render(
      <MemoryRouter initialEntries={["/"]}>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/analisis" element={<LocationEcho />} />
        </Routes>
      </MemoryRouter>,
    )
    // RECENT: label "M5" → month index 5 → month 6, año 2026.
    await user.click(await screen.findByTitle("Ver M5 en Análisis"))
    const loc = await screen.findByTestId("loc")
    expect(loc).toHaveTextContent("/analisis")
    expect(loc).toHaveTextContent("granularity=month")
    expect(loc).toHaveTextContent("year=2026")
    expect(loc).toHaveTextContent("month=6")
  })
})
