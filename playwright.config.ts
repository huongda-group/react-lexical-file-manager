import { defineConfig } from '@playwright/test';

export default defineConfig({
  testDir: './e2e',
  use: {
    baseURL: 'http://localhost:5176',
    headless: true
  },
  webServer: {
    command: 'npm run example -- --port 5176',
    url: 'http://localhost:5176',
    reuseExistingServer: !process.env['CI'],
    timeout: 30000
  }
});
