
import { test, expect } from '@playwright/test';

test.describe('EOS Features', () => {
  test.beforeEach(async ({ page }) => {
    // Mock authentication for E2E tests
    await page.goto('/');
    // Add authentication setup here
  });

  test('should create and view rocks', async ({ page }) => {
    await page.goto('/rocks');

    // Create a new rock
    await page.getByRole('button', { name: 'Add Rock' }).click();
    await page.getByPlaceholder('Rock title').fill('Test Rock');
    await page.getByPlaceholder('Description').fill('Test description');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should see the new rock
    await expect(page.getByText('Test Rock')).toBeVisible();
  });

  test('should create and resolve issues', async ({ page }) => {
    await page.goto('/issues');

    // Create a new issue
    await page.getByRole('button', { name: 'Add Issue' }).click();
    await page.getByPlaceholder('Issue title').fill('Test Issue');
    await page.getByPlaceholder('Description').fill('Test issue description');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should see the new issue
    await expect(page.getByText('Test Issue')).toBeVisible();

    // Mark as resolved
    await page.getByRole('button', { name: 'Mark Resolved' }).click();
    await expect(page.getByText('Resolved')).toBeVisible();
  });

  test('should manage KPIs and values', async ({ page }) => {
    await page.goto('/scorecard');

    // Create a new KPI
    await page.getByRole('button', { name: 'Add KPI' }).click();
    await page.getByPlaceholder('KPI name').fill('Test Metric');
    await page.getByPlaceholder('Unit').fill('USD');
    await page.getByRole('button', { name: 'Create' }).click();

    // Should see the new KPI
    await expect(page.getByText('Test Metric')).toBeVisible();

    // Update KPI value
    await page.getByRole('button', { name: 'Update Value' }).click();
    await page.getByPlaceholder('Value').fill('1000');
    await page.getByRole('button', { name: 'Save' }).click();

    // Should see updated value
    await expect(page.getByText('1000')).toBeVisible();
  });
});
