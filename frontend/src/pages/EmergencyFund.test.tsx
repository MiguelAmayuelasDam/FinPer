import { cleanup, render, screen, waitFor } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { MemoryRouter } from "react-router-dom"
import { afterEach, describe, expect, it, vi } from "vitest"

import EmergencyFund from "@/pages/EmergencyFund"

function json(status: number, body: unknown): Response {
  return { ok: status >= 200 && status < 300, status, json: async () => body } as Response
}

const FUND = {
  monthly_need: "1000.00", target_months: 6, target: "6000.00",
  saved: "2000.00", remaining: "4000.00", pct: 33,
  contributions: [{ id: "a1", amount: "2000.00", occurred_on: "2026-07-01" }],
}

function installFetch() {
  const fetchMock = vi.fn(async (url: string, init?: RequestInit) => {
    if (url.includes("/emergency-fund/contributions") && init?.method === "POST") {
      return json(201, { id: "a2", amount: "500.00", occurred_on: "2026-07-13" })
    }
    if (url.includes("/emergency-fund")) return json(200, FUND)
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

describe("EmergencyFund", () => {
  it("muestra el ahorrado, el objetivo y las aportaciones", async () => {
    installFetch()
    localStorage.setItem("numario.access", "ACC")
    render(
      <MemoryRouter>
        <EmergencyFund />
      </MemoryRouter>,
    )
    expect(await screen.findByTestId("ef-saved")).toHaveTextContent(/2\.?000,00/)
    expect(screen.getByText(/de 6\.?000,00/)).toBeInTheDocument()
    expect(screen.getByText(/Te faltan/)).toBeInTheDocument()
  })

  it("añade un monto al colchón", async () => {
    const fetchMock = installFetch()
    const user = userEvent.setup()
    localStorage.setItem("numario.access", "ACC")
    render(
      <MemoryRouter>
        <EmergencyFund />
      </MemoryRouter>,
    )
    await screen.findByTestId("ef-saved")

    await user.click(screen.getByRole("button", { name: "Añadir monto" }))
    await user.type(screen.getByLabelText("Cantidad (€)"), "500")
    await user.click(screen.getByRole("button", { name: "Añadir" }))

    await waitFor(() => {
      const post = fetchMock.mock.calls.find(
        ([u, init]) =>
          (u as string).includes("/emergency-fund/contributions") &&
          (init as RequestInit)?.method === "POST",
      )
      expect(post).toBeTruthy()
      expect(JSON.parse((post![1] as RequestInit).body as string)).toMatchObject({
        amount: "500",
      })
    })
  })
})
