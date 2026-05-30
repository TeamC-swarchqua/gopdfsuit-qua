import { defineConfig } from '@playwright/test'

const AUTH_JWT_SECRET = 'validation-auth-secret'

// Stack local con auth habilitada (como make run): auth-ms + backend + frontend.
export default defineConfig({
  testDir: '.',
  testMatch: ['**/*.spec.js'],
  workers: 1,
  timeout: 120_000,
  expect: { timeout: 30_000 },
  reporter: [
    ['list'],
    ['html', { open: 'never' }],
  ],
  use: {
    baseURL: 'http://localhost:3000',
    headless: true,
    screenshot: 'on',
    video: 'on',
  },
  webServer: [
    {
      command: 'go run ./auth-ms',
      cwd: '../../..',
      url: 'http://localhost:9090/health',
      reuseExistingServer: false,
      timeout: 180_000,
      env: {
        GOTOOLCHAIN: 'auto',
        AUTH_PORT: '9090',
        AUTH_DB_PATH: ':memory:',
        AUTH_JWT_SECRET,
        AUTH_CORS_ORIGIN: '*',
      },
    },
    {
      command: 'go run ./cmd/gopdfsuit',
      cwd: '../../..',
      url: 'http://localhost:8080/',
      reuseExistingServer: true,
      timeout: 180_000,
      env: {
        GOTOOLCHAIN: 'auto',
        AUTH_ENABLED: 'true',
        AUTH_JWT_SECRET,
      },
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
        VITE_AUTH_ENABLED: 'true',
        VITE_AUTH_URL: 'http://localhost:9090',
        VITE_API_URL: 'http://localhost:8080',
      },
    },
  ],
})
