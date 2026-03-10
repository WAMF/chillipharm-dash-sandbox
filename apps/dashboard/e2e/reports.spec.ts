import { test, expect } from '@playwright/test';

test.describe('Reports (unauthenticated)', () => {
    test('redirects to login when not authenticated', async ({ page }) => {
        await page.goto('/dashboard/reports');
        await expect(page).toHaveURL(/\/login/, { timeout: 10_000 });
    });
});

test.describe('Reports Section', () => {
    test.skip(
        !process.env.TEST_USER_EMAIL,
        'Skipping authenticated tests — set TEST_USER_EMAIL and TEST_USER_PASSWORD to run',
    );

    test.use({ storageState: 'apps/dashboard/.auth/user.json' });

    test('displays reports header and tabs', async ({ page }) => {
        await page.goto('/dashboard/reports');
        await expect(page.getByRole('heading', { name: 'Reports' })).toBeVisible();
        await expect(page.getByText('Manage report templates, email lists, and scheduled delivery.')).toBeVisible();
    });

    test('shows Templates, Email Lists, and Schedules tabs', async ({ page }) => {
        await page.goto('/dashboard/reports');
        const nav = page.locator('nav', { has: page.getByText('Templates') });
        await expect(nav.getByText('Templates')).toBeVisible();
        await expect(nav.getByText('Email Lists')).toBeVisible();
        await expect(nav.getByText('Schedules')).toBeVisible();
    });

    test('navigates between report tabs', async ({ page }) => {
        await page.goto('/dashboard/reports/templates');
        await expect(page).toHaveURL(/\/reports\/templates/);

        await page.getByRole('link', { name: 'Email Lists' }).click();
        await expect(page).toHaveURL(/\/reports\/email-lists/);

        await page.getByRole('link', { name: 'Schedules' }).click();
        await expect(page).toHaveURL(/\/reports\/schedules/);

        await page.getByRole('link', { name: 'Templates' }).click();
        await expect(page).toHaveURL(/\/reports\/templates/);
    });

    test('templates page has Create Template button', async ({ page }) => {
        await page.goto('/dashboard/reports/templates');
        await expect(
            page.getByRole('button', { name: /Create Template/i }),
        ).toBeVisible({ timeout: 10_000 });
    });
});
