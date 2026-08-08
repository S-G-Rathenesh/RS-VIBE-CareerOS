import { test, expect } from '@playwright/test';

test.describe('Candidate Journey', () => {
  test('should allow candidate to login and view dashboard', async ({ page }) => {
    // Navigate to login
    await page.goto('/login');
    
    // Fill credentials (assuming we have a mock user or we just test UI elements)
    await page.fill('input[type="email"]', 'candidate@example.com');
    await page.fill('input[type="password"]', 'password123');
    await page.click('button[type="submit"]');

    // Wait for navigation
    await page.waitForURL('/dashboard');
    
    // Verify dashboard elements
    await expect(page.locator('h1')).toContainText('Welcome back');
    await expect(page.locator('text=Parent Resumes')).toBeVisible();
    await expect(page.locator('text=Active Applications')).toBeVisible();
  });

  test('should navigate to resume builder', async ({ page }) => {
    // We mock login via storage state in a real CI setup, but here we just navigate
    // to check if the route renders properly without crashing.
    await page.goto('/resumes');
    await expect(page.locator('h1')).toContainText('Resume Control Center');
  });
});
