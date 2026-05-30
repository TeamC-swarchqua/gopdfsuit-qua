import { test, expect } from '@playwright/test'
import { gotoProtectedTool } from './helpers/navigation.js'
import {
  switchToRegisterTab,
  switchToLoginTab,
  fillCredentials,
  submitLogin,
  submitRegister,
  expectAuthError,
  expectOnLoginPage,
  expectAuthenticated,
  logout,
  clearAuthStorage,
} from './helpers/auth-ui.js'

test.describe('Flujo validación RF auth', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/gopdfsuit/')
    await clearAuthStorage(page)
  })

  test('registro, login y control de acceso (FR-AUTH-01..06)', async ({ page }) => {
    const email = `auth_val_${Date.now()}@example.com`
    const password = 'supersecret123'

    await test.step('FR-AUTH-01 — Vista con correo y contraseña para acceder', async () => {
      await gotoProtectedTool(page, 'editor')
      await expectOnLoginPage(page)
      await expect(page.getByRole('heading', { name: /Bienvenido de nuevo/i })).toBeVisible()
      await expect(page.getByTestId('auth-email')).toBeVisible()
      await expect(page.getByTestId('auth-password')).toBeVisible()
      await switchToRegisterTab(page)
      await expect(page.getByTestId('auth-email')).toBeVisible()
      await expect(page.getByTestId('auth-password')).toBeVisible()
      await switchToLoginTab(page)
    })

    await test.step('FR-AUTH-06 — Sin sesión no se accede a la herramienta', async () => {
      await expect(page).toHaveURL(/#\/login/)
      await expect(page.getByTestId('auth-form')).toBeVisible()
      await expect(page.getByText('PDF Template Editor')).toHaveCount(0)
    })

    await test.step('FR-AUTH-05 — Credenciales inválidas muestran error y bloquean acceso', async () => {
      await fillCredentials(page, 'noexiste@example.com', 'wrongpassword')
      await submitLogin(page)
      await expectAuthError(page, /invalid credentials/i)
      await expectOnLoginPage(page)
      const token = await page.evaluate(() => localStorage.getItem('auth_token'))
      expect(token).toBeFalsy()
    })

    await test.step('FR-AUTH-02 — Registro con correo nuevo y contraseña ≥ 8 caracteres', async () => {
      await switchToRegisterTab(page)
      await fillCredentials(page, email, password)
      await submitRegister(page)
      await expect(page.getByTestId('auth-error')).toHaveCount(0, { timeout: 15_000 })
    })

    await test.step('FR-AUTH-03 — Tras registro exitoso accede a la herramienta solicitada', async () => {
      await expectAuthenticated(page)
      await expect(page).toHaveURL(/#\/editor/, { timeout: 15_000 })
      await expect(page.getByText('PDF Template Editor')).toBeVisible({ timeout: 15_000 })

      await gotoProtectedTool(page, 'filler')
      await expect(page).toHaveURL(/#\/filler/)
      await expect(page.getByRole('heading', { name: /PDF Form Filler/i })).toBeVisible()
      await expect(page.getByTestId('auth-form')).toHaveCount(0)
    })

    await test.step('FR-AUTH-04 — Registro duplicado informa error', async () => {
      await logout(page)
      await switchToRegisterTab(page)
      await fillCredentials(page, email, password)
      await submitRegister(page)
      await expectAuthError(page, /already registered/i)
      await expectOnLoginPage(page)
      await expect(page.getByText('PDF Template Editor')).toHaveCount(0)
    })
  })
})
