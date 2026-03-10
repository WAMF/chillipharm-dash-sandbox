import { test, expect } from '@playwright/test';

test.describe('Dashboard (unauthenticated)', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
});

test.describe('Dashboard Navigation', () => {
    test.skip(
        !(process.env.TEST_USER_EMAIL && process.env.TEST_USER_PASSWORD),
        'Skipping authenticated tests — set TEST_USER_EMAIL and TEST_USER_PASSWORD to run',
    );

    test.use({ storageState: 'apps/dashboard/.auth/user.json' });

    test('shows sidebar navigation items', async ({ page }) => {
        await page.goto('/dashboard');
        await expect(page.getByText('ChilliPharm').first()).toBeVisible();

        const sidebar = page.locator('aside');
        await expect(sidebar.getByText('Overview')).toBeVisible();
        await expect(sidebar.getByText('Browse')).toBeVisible();
        await expect(sidebar.getByText('Reports')).toBeVisible();
        await expect(sidebar.getByText('Export')).toBeVisible();
        await expect(sidebar.getByText('Sign Out')).toBeVisible();
    });

    test('navigates to Browse page', async ({ page }) => {
        await page.goto('/dashboard');
        await page.locator('aside').getByText('Browse').click();
        await expect(page).toHaveURL(/\/dashboard\/browse/);
    });

    test('navigates to Reports page', async ({ page }) => {
        await page.goto('/dashboard');
        await page.locator('aside').getByText('Reports').click();
        await expect(page).toHaveURL(/\/dashboard\/reports/);
    });

    test('Overview link navigates back to dashboard', async ({ page }) => {
        await page.goto('/dashboard/reports');
        await page.locator('aside').getByText('Overview').click();
        await expect(page).toHaveURL(/\/dashboard$/);
    });
});
