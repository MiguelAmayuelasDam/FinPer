import { cleanup, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import { afterEach, describe, expect, it, vi } from "vitest"

import Profile from "@/pages/Profile"

const updateProfile = vi.fn(async () => {})

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ user: { nickname: "ana", email: "a@b.com" }, updateProfile }),
}))

afterEach(() => {
  cleanup()
  vi.clearAllMocks()
})

describe("Profile", () => {
  it("muestra el nick y el email actuales", () => {
    render(<Profile />)
    expect(screen.getByLabelText("Nick")).toHaveValue("ana")
    expect(screen.getByLabelText("Email")).toHaveValue("a@b.com")
  })

  it("guarda el nuevo nick", async () => {
    const user = userEvent.setup()
    render(<Profile />)
    const input = screen.getByLabelText("Nick")
    await user.clear(input)
    await user.type(input, "ananueva")
    await user.click(screen.getByRole("button", { name: "Guardar" }))
    expect(updateProfile).toHaveBeenCalledWith("ananueva")
  })

  it("mantiene el guardado deshabilitado si el nick no cambia", () => {
    render(<Profile />)
    expect(screen.getByRole("button", { name: "Guardar" })).toBeDisabled()
  })
})
