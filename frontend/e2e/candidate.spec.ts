import { test, expect } from '@playwright/test';

test.describe('Candidate Journey', () => {
  test.beforeEach(async ({ page }) => {
    // Add mock token to localStorage
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock-token');
    });

    await page.route('**/api/v1/**', route => {
      if (route.request().url().includes('/auth/login')) {
        route.fulfill({ status: 200, json: { access_token: 'mock-token', user: { role: 'candidate' } } });
      } else if (route.request().url().includes('/auth/me')) {
        route.fulfill({ status: 200, json: { success: true, data: { id: '1', role: 'candidate', full_name: 'Test Candidate' } } });
      } else {
        route.fulfill({ status: 500, json: { error: 'mock error' } });
      }
    });
  });
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
    await expect(page.getByText(/Welcome back/i).first()).toBeVisible({ timeout: 10000 });
  });

  test('should navigate to resume builder', async ({ page }) => {
    // We mock login via storage state in a real CI setup, but here we just navigate
    // to check if the route renders properly without crashing.
    await page.goto('/resumes');
    await expect(page.locator('h1', { hasText: 'My Resumes' }).first()).toBeVisible({ timeout: 10000 });
  });
});
