import { expect } from '@playwright/test'

export async function switchToLoginTab(page) {
  await page.getByRole('button', { name: /^Iniciar sesión$/i }).first().click()
  await expect(page.getByRole('heading', { name: /Bienvenido de nuevo/i })).toBeVisible()
}

export async function switchToRegisterTab(page) {
  await page.getByRole('button', { name: /^Crear cuenta$/i }).first().click()
  await expect(page.getByRole('heading', { name: /Crear cuenta nueva/i })).toBeVisible()
}

export async function fillCredentials(page, email, password) {
  await page.getByTestId('auth-email').fill(email)
  await page.getByTestId('auth-password').fill(password)
}

export async function submitLogin(page) {
  await page.getByTestId('auth-login').click()
}

export async function submitRegister(page) {
  await page.getByTestId('auth-register').click()
}

export async function expectAuthError(page, pattern) {
  await expect(page.getByTestId('auth-error')).toBeVisible()
  await expect(page.getByTestId('auth-error')).toContainText(pattern)
}

export async function expectOnLoginPage(page) {
  await expect(page).toHaveURL(/#\/login/)
  await expect(page.getByTestId('auth-form')).toBeVisible()
}

export async function expectAuthenticated(page) {
  await expect(page.getByTestId('auth-form')).toHaveCount(0, { timeout: 15_000 })
  const token = await page.evaluate(() => localStorage.getItem('auth_token'))
  expect(token).toBeTruthy()
}

export async function logout(page) {
  await page.getByRole('button', { name: /Sign Out/i }).first().click()
  await expect(page).toHaveURL(/#\/login/, { timeout: 10_000 })
}

export async function clearAuthStorage(page) {
  await page.evaluate(() => {
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
  })
}
