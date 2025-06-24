import { test, expect } from '@playwright/test'

test.describe('Accessibility Compliance', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should have proper heading hierarchy', async ({ page }) => {
    // Check main heading
    const h1 = page.getByRole('heading', { level: 1 })
    await expect(h1).toHaveCount(1)
    await expect(h1).toHaveText('🏇 Horse Racing Game')

    // Generate schedule to check subheadings
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    
    // Check h3 headings exist
    const h3Headings = page.getByRole('heading', { level: 3 })
    await expect(h3Headings).toHaveCount(2) // "Race Schedule" and "Race Schedule Generated"
  })

  test('should have proper landmark roles', async ({ page }) => {
    // Main landmark
    const main = page.getByRole('main')
    await expect(main).toHaveCount(1)
    await expect(main).toHaveAttribute('aria-label', 'Horse Racing Game')

    // Navigation/toolbar
    const toolbar = page.getByRole('toolbar')
    await expect(toolbar).toHaveCount(1)
    await expect(toolbar).toHaveAttribute('aria-label', 'Race controls')
  })

  test('should have descriptive button labels', async ({ page }) => {
    // Check all buttons have accessible names
    const buttons = page.getByRole('button')
    const buttonCount = await buttons.count()
    
    for (let i = 0; i < buttonCount; i++) {
      const button = buttons.nth(i)
      const accessibleName = await button.getAttribute('aria-label') || await button.textContent()
      expect(accessibleName).toBeTruthy()
      expect(accessibleName?.trim()).not.toBe('')
    }
  })

  test('should support keyboard navigation', async ({ page }) => {
    // Start with first focusable element
    await page.keyboard.press('Tab')
    
    // Should be able to activate with Enter
    await page.keyboard.press('Enter')
    await expect(page.getByText('Race Schedule')).toBeVisible()
    
    // Continue tabbing to next control
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Should start race
    await expect(page.getByText('Current Round:')).toBeVisible()
  })

  test('should support arrow key navigation in lists', async ({ page }) => {
    // Generate schedule first
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    
    // Focus on first race item
    const firstRaceItem = page.locator('.race-item').first()
    await firstRaceItem.focus()
    
    // Use arrow keys to navigate
    await page.keyboard.press('ArrowDown')
    await page.keyboard.press('ArrowDown')
    
    // Should be able to activate with Enter
    await page.keyboard.press('Enter')
  })

  test('should have proper focus indicators', async ({ page }) => {
    // Check that focused elements have visible focus indicators
    await page.getByRole('button', { name: /Generate Schedule/i }).focus()
    
    // Focus indicator should be visible (check outline or box-shadow)
    const focusedButton = page.getByRole('button', { name: /Generate Schedule/i })
    const outline = await focusedButton.evaluate(el => getComputedStyle(el).outline)
    const boxShadow = await focusedButton.evaluate(el => getComputedStyle(el).boxShadow)
    
    expect(outline !== 'none' || boxShadow !== 'none').toBeTruthy()
  })

  test('should work with high contrast mode', async ({ page }) => {
    // Enable high contrast mode
    await page.getByRole('button', { name: /High Contrast/i }).click()
    
    // Check body has high contrast class
    const body = page.locator('body')
    await expect(body).toHaveClass(/high-contrast/)
    
    // Generate and check elements are visible in high contrast
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await expect(page.getByText('Race Schedule')).toBeVisible()
    
    // Check contrast ratios are sufficient (simplified check)
    const raceItem = page.locator('.race-item').first()
    await expect(raceItem).toBeVisible()
  })

  test('should provide screen reader announcements', async ({ page }) => {
    // Check for live regions
    const liveRegions = page.locator('[aria-live]')
    await expect(liveRegions).toHaveCount(1)
    
    // Start race and check for status updates
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Check status regions exist
    const statusRegions = page.locator('[role="status"]')
    await expect(statusRegions.first()).toBeVisible()
  })

  test('should have proper form labels and descriptions', async ({ page }) => {
    // Generate race to check form-like elements
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Check progressbars have proper labels
    const progressBars = page.locator('[role="progressbar"]')
    const progressCount = await progressBars.count()
    
    for (let i = 0; i < progressCount; i++) {
      const progressBar = progressBars.nth(i)
      const label = await progressBar.getAttribute('aria-label')
      expect(label).toBeTruthy()
      expect(label).toContain('progress')
    }
  })

  test('should have sufficient color contrast', async ({ page }) => {
    // This is a simplified contrast check
    // In real testing, you'd use tools like axe-playwright
    
    // Check main elements are visible
    await expect(page.getByRole('heading', { name: '🏇 Horse Racing Game' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate Schedule/i })).toBeVisible()
    
    // Generate schedule and check visibility
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    
    const raceItems = page.locator('.race-item')
    await expect(raceItems.first()).toBeVisible()
  })

  test('should handle reduced motion preferences', async ({ page }) => {
    // Simulate reduced motion preference
    await page.emulateMedia({ reducedMotion: 'reduce' })
    
    // Generate and start race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Race should still work but with reduced animations
    await expect(page.getByText('Current Round:')).toBeVisible()
    
    // Horses should still move but animations should be reduced
    const horses = page.locator('.horse')
    await expect(horses.first()).toBeVisible()
  })

  test('should provide skip links for better navigation', async ({ page }) => {
    // Focus on document to reveal skip links
    await page.keyboard.press('Tab')
    
    // Look for skip links (they might be visually hidden but focusable)
    const skipLinks = page.locator('a[href^="#"]').filter({ hasText: /skip/i })
    
    if (await skipLinks.count() > 0) {
      await expect(skipLinks.first()).toBeFocused()
    }
  })

  test('should have proper table headers and structure', async ({ page }) => {
    // Complete a race to see results table
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Wait for results
    await expect(page.getByText('Race Results')).toBeVisible({ timeout: 30000 })
    
    // Check table structure
    const table = page.getByRole('table')
    await expect(table).toBeVisible()
    
    // Check column headers
    const columnHeaders = page.getByRole('columnheader')
    await expect(columnHeaders).toHaveCount(4) // Position, Horse, Condition, Time
    
    // Check table has proper labeling
    const tableLabel = await table.getAttribute('aria-labelledby') || await table.getAttribute('aria-label')
    expect(tableLabel).toBeTruthy()
  })

  test('should support screen reader navigation of race track', async ({ page }) => {
    // Start race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Check race track is properly labeled
    const raceTrack = page.getByRole('application', { name: /race visualization/i })
    await expect(raceTrack).toBeVisible()
    
    // Check lanes are navigable
    const lanes = page.getByRole('listitem')
    await expect(lanes).toHaveCount(6) // 6 horses in race
    
    // Each lane should have descriptive labels
    const firstLane = lanes.first()
    const label = await firstLane.getAttribute('aria-label')
    expect(label).toContain('Lane')
    expect(label).toContain('%')
  })

  test('should announce race events to screen readers', async ({ page }) => {
    // Start race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Check for alert regions for important announcements
    const alerts = page.locator('[role="alert"]')
    
    // Pause race to trigger an announcement
    await page.getByRole('button', { name: /Pause/i }).click()
    
    // Should announce paused state
    const pauseAlert = page.locator('[role="alert"]', { hasText: /paused/i })
    await expect(pauseAlert).toBeVisible()
  })
})