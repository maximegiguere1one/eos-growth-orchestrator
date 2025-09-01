
import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should allow user to sign up and sign in', async ({ page }) => {
    const email = `test+${Date.now()}@example.com`;
    const password = 'testpass123';
    const displayName = 'Test User';

    // Go to auth page
    await page.goto('/auth');

    // Sign up
    await page.getByRole('tab', { name: 'Sign Up' }).click();
    await page.getByPlaceholder('Your Name').fill(displayName);
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').first().fill(password);
    await page.getByPlaceholder('••••••••').last().fill(password);
    await page.getByRole('button', { name: 'Create Account' }).click();

    // Should show success message
    await expect(page.getByText('Account created successfully')).toBeVisible();

    // Sign in
    await page.getByRole('tab', { name: 'Sign In' }).click();
    await page.getByPlaceholder('you@example.com').fill(email);
    await page.getByPlaceholder('••••••••').fill(password);
    await page.getByRole('button', { name: 'Sign In' }).click();

    // Should redirect to dashboard
    await expect(page.url()).toContain('/');
    await expect(page.getByText('Dashboard')).toBeVisible();
  });

  test('should show validation errors for invalid input', async ({ page }) => {
    await page.goto('/auth');

    // Try to sign in with invalid email
    await page.getByPlaceholder('you@example.com').fill('invalid-email');
    await page.getByRole('button', { name: 'Sign In' }).click();

    await expect(page.getByText('Invalid email address')).toBeVisible();
  });

  test('should handle password reset', async ({ page }) => {
    await page.goto('/auth');

    await page.getByRole('tab', { name: 'Reset' }).click();
    await page.getByPlaceholder('you@example.com').fill('test@example.com');
    await page.getByRole('button', { name: 'Send Reset Email' }).click();

    await expect(page.getByText('Password reset email sent')).toBeVisible();
  });
});
