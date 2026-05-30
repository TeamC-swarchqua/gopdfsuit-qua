/**
 * Semilla localStorage para pasar AuthGuard en el flujo filler (modo local sin JWT).
 * No valida FR-AUTH-01..06; esos RFs se prueban en auth.spec.js y auth-ms/auth_test.go.
 */
export async function seedAuth(page) {
  await page.goto('/gopdfsuit/')
  await page.evaluate(() => {
    localStorage.setItem('auth_token', 'e2e-local-test-token')
    localStorage.setItem(
      'auth_user',
      JSON.stringify({ email: 'test@e2e.local' }),
    )
  })
  await page.reload()
}
