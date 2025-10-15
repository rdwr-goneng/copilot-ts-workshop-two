import { test, expect } from '@playwright/test';

test.describe('Superheroes API Integration', () => {
  test('should successfully fetch superheroes data from API', async ({ page }) => {
    // Listen for API calls
    let apiResponse: any;
    page.on('response', response => {
      if (response.url().includes('/api/superheroes')) {
        apiResponse = response;
      }
    });

    await page.goto('http://localhost:3001');
    
    // Wait for the API call to complete
    await page.waitForLoadState('networkidle');
    
    // Verify API call was made and successful
    expect(apiResponse).toBeDefined();
    expect(apiResponse.status()).toBe(200);
    
    // Verify data is loaded in the UI
    await expect(page.locator('tbody tr').first()).toBeVisible();
  });

  test('should handle empty API response gracefully', async ({ page }) => {
    // Mock API to return empty array (simulating no data)
    await page.route('/api/superheroes', route => {
      route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Should still show the page structure even with no data
    await expect(page.locator('h1')).toContainText('Superheroes');
    await expect(page.locator('table')).toBeVisible();
    
    // But no superhero rows should be present
    await expect(page.locator('tbody tr')).toHaveCount(0);
  });

  test('should display correct superhero data structure', async ({ page }) => {
    let superheroesData: any;
    
    page.on('response', async response => {
      if (response.url().includes('/api/superheroes')) {
        superheroesData = await response.json();
      }
    });

    await page.goto('http://localhost:3001');
    await page.waitForLoadState('networkidle');
    
    // Verify the API returns expected data structure
    expect(superheroesData).toBeDefined();
    expect(Array.isArray(superheroesData)).toBeTruthy();
    
    if (superheroesData.length > 0) {
      const firstHero = superheroesData[0];
      expect(firstHero).toHaveProperty('id');
      expect(firstHero).toHaveProperty('name');
      expect(firstHero).toHaveProperty('image');
      expect(firstHero).toHaveProperty('powerstats');
      expect(firstHero.powerstats).toHaveProperty('intelligence');
      expect(firstHero.powerstats).toHaveProperty('strength');
      expect(firstHero.powerstats).toHaveProperty('speed');
      expect(firstHero.powerstats).toHaveProperty('durability');
      expect(firstHero.powerstats).toHaveProperty('power');
      expect(firstHero.powerstats).toHaveProperty('combat');
    }
  });
});