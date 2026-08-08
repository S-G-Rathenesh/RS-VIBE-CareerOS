import { test, expect } from '@playwright/test';

test.describe('Recruiter Journey', () => {
  test('should view recruiter dashboard', async ({ page }) => {
    await page.goto('/recruiter/dashboard');
    await expect(page.locator('h1')).toContainText('Recruiter Hub');
    await expect(page.locator('text=Active Jobs')).toBeVisible();
    await expect(page.locator('text=Discover Talent')).toBeVisible();
  });

  test('should view candidate search', async ({ page }) => {
    await page.goto('/recruiter/search');
    await expect(page.locator('h1')).toContainText('Candidate Search');
    await expect(page.locator('text=Filters')).toBeVisible();
  });
});
