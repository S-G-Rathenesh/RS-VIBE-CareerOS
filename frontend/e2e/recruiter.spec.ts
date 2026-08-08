import { test, expect } from '@playwright/test';

test.describe('Recruiter Journey', () => {
  test.beforeEach(async ({ page }) => {
    await page.addInitScript(() => {
      window.localStorage.setItem('access_token', 'mock-token');
    });
    
    await page.route('**/api/v1/**', route => {
      if (route.request().url().includes('/auth/me')) {
        route.fulfill({ status: 200, json: { success: true, data: { id: '2', role: 'recruiter', full_name: 'Test Recruiter' } } });
      } else {
        route.fulfill({ status: 500, json: { error: 'mock error' } });
      }
    });
  });
  test('should view recruiter dashboard', async ({ page }) => {
    await page.goto('/recruiter/dashboard');
    await expect(page.getByRole('heading', { name: 'Recruiter Hub' })).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Active Jobs').first()).toBeVisible({ timeout: 10000 });
    await expect(page.locator('text=Discover Talent').first()).toBeVisible({ timeout: 10000 });
  });

  test('should view candidate search', async ({ page }) => {
    await page.goto('/recruiter/search');
    await expect(page.getByRole('heading', { name: 'Candidate Search' })).toBeVisible({ timeout: 10000 });
    await expect(page.getByRole('heading', { name: 'Filters' })).toBeVisible({ timeout: 10000 });
  });
});
