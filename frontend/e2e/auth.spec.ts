import { expect, test, type Page } from "@playwright/test"

// Flujo real de autenticación contra el stack de docker compose:
// registro (con validación de contraseña) → dashboard → logout → login por
// nick → login por email.

// La sesión se cierra desde el submenú de perfil de la barra superior.
async function logout(page: Page) {
  await page.getByRole("button", { name: "Menú de perfil" }).click()
  await page.getByRole("button", { name: "Cerrar sesión" }).click()
}

function uniqueUser() {
  const suffix = Date.now().toString(36) + Math.random().toString(36).slice(2, 6)
  return {
    nickname: `user${suffix}`,
    email: `user${suffix}@mail.com`,
    password: "Str0ng!Pass",
  }
}

test("registro, logout y login por nick y por email", async ({ page }) => {
  const user = uniqueUser()

  // --- Registro ---
  await page.goto("/register")
  await page.getByLabel("Nick").fill(user.nickname)
  await page.getByLabel("Email").fill(user.email)
  await page.getByLabel("Contraseña", { exact: true }).fill(user.password)
  await page.getByLabel("Repetir contraseña").fill(user.password)
  await page.getByRole("button", { name: "Registrarme" }).click()

  // Barra superior autenticada con el nick visible.
  await expect(page.getByTestId("user-nickname")).toHaveText(user.nickname)

  // --- Logout (desde el submenú de perfil) ---
  await logout(page)
  await expect(page.getByRole("button", { name: "Entrar" })).toBeVisible()

  // --- Login por nick ---
  await page.getByLabel("Email o nick").fill(user.nickname)
  await page.getByLabel("Contraseña").fill(user.password)
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page.getByTestId("user-nickname")).toHaveText(user.nickname)

  // --- Logout + login por email ---
  await logout(page)
  await page.getByLabel("Email o nick").fill(user.email)
  await page.getByLabel("Contraseña").fill(user.password)
  await page.getByRole("button", { name: "Entrar" }).click()
  await expect(page.getByTestId("user-nickname")).toHaveText(user.nickname)
})
