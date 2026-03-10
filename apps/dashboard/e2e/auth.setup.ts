import { test as setup, expect } from '@playwright/test';
import path from 'node:path';

const AUTH_FILE = path.join(__dirname, '../.auth/user.json');

setup('authenticate', async ({ page }) => {
    const email = process.env.TEST_USER_EMAIL;
    const password = process.env.TEST_USER_PASSWORD;

    if (!email || !password) {
        throw new Error(
            'TEST_USER_EMAIL and TEST_USER_PASSWORD environment variables must be set for authenticated tests',
        );
    }

    await page.goto('/login');
    await page.locator('#email').fill(email);
    await page.locator('#password').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page).toHaveURL(/\/dashboard/, { timeout: 15_000 });

    await page.context().storageState({ path: AUTH_FILE });
});
