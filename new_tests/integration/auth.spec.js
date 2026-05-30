import { test, expect } from '@playwright/test'

// TC 05 (integración): Frontend -> auth-ms -> Backend.
// Cubre FR-AUTH-01, FR-AUTH-02, FR-AUTH-03 y FR-AUTH-06 en E2E.
// FR-AUTH-04 y FR-AUTH-05 se cubren en auth-ms/auth_test.go.

const EDITOR_URL = '/gopdfsuit/#/editor'
const AUTH_ENDPOINT = '/api/v1/test/auth'

test('TC 05: Frontend -> auth-ms -> Backend (login y verificación)', async ({ page }) => {
  const email = `tc05_${Date.now()}@example.com`
  const password = 'supersecret123'

  // FR-AUTH-01 — Vista con campos de correo y contraseña para acceder a las herramientas.
  await page.goto(EDITOR_URL)
  await expect(page.getByTestId('auth-form')).toBeVisible()
  await expect(page.getByRole('heading', { name: /Bienvenido de nuevo/i })).toBeVisible()

  await page.getByRole('button', { name: /^Crear cuenta$/ }).first().click()
  await expect(page.getByRole('heading', { name: /Crear cuenta nueva/i })).toBeVisible()
  await expect(page.getByTestId('auth-email')).toBeVisible()
  await expect(page.getByTestId('auth-password')).toBeVisible()

  // FR-AUTH-02 — Registrar nuevo usuario (correo nuevo, contraseña ≥ 8 caracteres).
  await page.getByTestId('auth-email').fill(email)
  await page.getByTestId('auth-password').fill(password)
  await page.getByTestId('auth-register').click()

  // FR-AUTH-03 — Tras registro exitoso, usuario autenticado accede a la herramienta (/editor).
  await expect(page.getByTestId('auth-form')).toHaveCount(0, { timeout: 15000 })
  const token = await page.evaluate(() => localStorage.getItem('auth_token'))
  expect(token).toBeTruthy()

  // FR-AUTH-06 — Backend verifica autenticidad del token antes de operaciones protegidas.
  const backendResponse = await page.evaluate(async ([url, tok]) => {
    const res = await fetch(url, {
      method: 'GET',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${tok}` },
    })
    return { status: res.status, data: await res.json() }
  }, [AUTH_ENDPOINT, token])

  expect(backendResponse.status).toBe(200)
  expect(backendResponse.data.authenticated).toBe(true)
  expect(backendResponse.data.user.email).toBe(email)
})
