import { test, expect } from '@playwright/test';

test.describe('Login Page', () => {
    test.beforeEach(async ({ page }) => {
        await page.goto('/login');
    });

    test('displays the login form', async ({ page }) => {
        await expect(page.getByText('ChilliPharm')).toBeVisible();
        await expect(page.getByText('Clinical Trial Video Platform')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.locator('#password')).toBeVisible();
        await expect(page.getByRole('button', { name: 'Sign In' })).toBeVisible();
    });

    test('email and password fields accept input', async ({ page }) => {
        const emailInput = page.locator('#email');
        const passwordInput = page.locator('#password');

        await emailInput.fill('test@example.com');
        await passwordInput.fill('password123');

        await expect(emailInput).toHaveValue('test@example.com');
        await expect(passwordInput).toHaveValue('password123');
    });

    test('shows error on invalid credentials', async ({ page }) => {
        await page.locator('#email').fill('invalid@example.com');
        await page.locator('#password').fill('wrongpassword');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByText('Invalid email or password')).toBeVisible({ timeout: 10_000 });
    });

    test('shows loading state while signing in', async ({ page }) => {
        await page.locator('#email').fill('test@example.com');
        await page.locator('#password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByText('Signing in...')).toBeVisible();
    });

    test('email field has correct type attribute', async ({ page }) => {
        await expect(page.locator('#email')).toHaveAttribute('type', 'email');
    });

    test('password field has correct type attribute', async ({ page }) => {
        await expect(page.locator('#password')).toHaveAttribute('type', 'password');
    });

    test('submit button is disabled while loading', async ({ page }) => {
        await page.locator('#email').fill('test@example.com');
        await page.locator('#password').fill('password123');
        await page.getByRole('button', { name: 'Sign In' }).click();

        await expect(page.getByRole('button', { name: /Signing in/ })).toBeDisabled();
    });
});
