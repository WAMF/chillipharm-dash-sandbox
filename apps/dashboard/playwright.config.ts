import path from 'node:path';
import { defineConfig, devices } from '@playwright/test';

const BASE_URL = process.env.BASE_URL || 'http://localhost:3000';
const hasAuthEnv = !!(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD);

export default defineConfig({
    testDir: './e2e',
    fullyParallel: true,
    forbidOnly: !!process.env.CI,
    retries: process.env.CI ? 2 : 0,
    workers: process.env.CI ? 1 : undefined,
    reporter: 'html',
    use: {
        baseURL: BASE_URL,
        trace: 'on-first-retry',
        screenshot: 'only-on-failure',
    },
    projects: [
        ...(hasAuthEnv
            ? [
                  {
                      name: 'setup',
                      testMatch: /auth\.setup\.ts/,
                  },
              ]
            : []),
        {
            name: 'chromium',
            use: { ...devices['Desktop Chrome'] },
            ...(hasAuthEnv ? { dependencies: ['setup'] } : {}),
        },
    ],
    webServer: process.env.CI
        ? undefined
        : {
              command: 'npm run dev',
              cwd: path.resolve(__dirname, '../..'),
              url: BASE_URL,
              reuseExistingServer: true,
              timeout: 120_000,
          },
});
