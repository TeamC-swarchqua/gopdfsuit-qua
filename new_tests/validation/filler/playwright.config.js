import { defineConfig } from '@playwright/test'

// Validation filler flow: backend + frontend sin auth (no AUTH_ENABLED / K_SERVICE).
// Playwright webServer arranca go run + npm run dev (sin Docker).
export default defineConfig({
  testDir: '.',
  testMatch: ['**/*.spec.js'],
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }], // cada test.step('FR-FILLER-XX …') aparece como paso en el reporte HTML
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
   //trace: 'on-first-retry',
   // video: 'retain-on-failure',
    screenshot: 'on',           // opcional: screenshot en cada paso del reporte
    video: 'on', 
    acceptDownloads: true,
  },
  webServer: [
    {
      command: 'go run ./cmd/gopdfsuit',
      cwd: '../../..',
      url: 'http://localhost:8080/',
      reuseExistingServer: true,
      timeout: 180_000,
      env: { GOTOOLCHAIN: 'auto' },
    },
    {
      command: 'npm run dev',
      cwd: '../../../frontend',
      port: 3000,
      reuseExistingServer: true,
      timeout: 60_000,
      env: {
        VITE_IS_CLOUD_RUN: 'false',
        VITE_ENVIRONMENT: 'local',
        VITE_API_URL: 'http://localhost:8080',
      },
    },
  ],
})
