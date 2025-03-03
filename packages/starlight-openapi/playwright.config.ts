import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  forbidOnly: !!process.env['CI'],
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], headless: true },
    },
  ],
  use: {
    baseURL: 'http://localhost:4321',
  },
  webServer: [
    {
      command: 'TEST=1 pnpm build && pnpm preview',
      cwd: '../../docs',
      reuseExistingServer: !process.env['CI'],
      url: 'http://localhost:4321',
    },
  ],
})
