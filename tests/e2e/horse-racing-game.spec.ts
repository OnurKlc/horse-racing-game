import { test, expect } from '@playwright/test'

test.describe('Horse Racing Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the game interface', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: '🏇 Horse Racing Game' })).toBeVisible()
    
    // Check main controls are present
    await expect(page.getByRole('button', { name: /Generate Schedule/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /High Contrast/i })).toBeVisible()
    await expect(page.getByRole('button', { name: /Sound/i })).toBeVisible()
  })

  test('should generate race schedule', async ({ page }) => {
    // Click generate schedule button
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    
    // Wait for schedule to be generated
    await expect(page.getByText('Race Schedule')).toBeVisible()
    
    // Check that 6 rounds are created
    const raceItems = page.locator('.race-item')
    await expect(raceItems).toHaveCount(6)
    
    // Check start race button appears
    await expect(page.getByRole('button', { name: /Start Race/i })).toBeVisible()
  })

  test('should start and run a race', async ({ page }) => {
    // Generate schedule first
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await expect(page.getByText('Race Schedule')).toBeVisible()
    
    // Start the race
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Check race is running
    await expect(page.getByText('Current Round:')).toBeVisible()
    await expect(page.getByRole('button', { name: /Pause/i })).toBeVisible()
    
    // Wait for race to progress
    await page.waitForTimeout(2000)
    
    // Horses should be moving (positions should change)
    const horsePositions = page.locator('.horse')
    await expect(horsePositions.first()).toBeVisible()
  })

  test('should pause and resume race', async ({ page }) => {
    // Setup race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Pause the race
    await page.getByRole('button', { name: /Pause/i }).click()
    await expect(page.getByText('⏸️ Race Paused')).toBeVisible()
    await expect(page.getByRole('button', { name: /Resume/i })).toBeVisible()
    
    // Resume the race
    await page.getByRole('button', { name: /Resume/i }).click()
    await expect(page.getByText('⏸️ Race Paused')).not.toBeVisible()
  })

  test('should complete race and show results', async ({ page }) => {
    // Generate and start race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Wait for race to complete (this might take a while)
    await expect(page.getByText('Race Results')).toBeVisible({ timeout: 30000 })
    
    // Check podium is shown
    await expect(page.locator('.podium')).toBeVisible()
    
    // Check results table is shown
    await expect(page.locator('.results-table')).toBeVisible()
    
    // Check winner gets confetti
    await expect(page.locator('.confetti-container')).toBeVisible()
  })

  test('should navigate through multiple rounds', async ({ page }) => {
    // Generate race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    
    // Complete first race
    await page.getByRole('button', { name: /Start Race/i }).click()
    await expect(page.getByText('Race Results')).toBeVisible({ timeout: 30000 })
    
    // Start next round
    await page.getByRole('button', { name: /Next Round/i }).click()
    await expect(page.getByText('Current Round: 2')).toBeVisible()
  })
})

test.describe('Accessibility Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle high contrast mode', async ({ page }) => {
    // Toggle high contrast
    await page.getByRole('button', { name: /High Contrast/i }).click()
    
    // Check body has high contrast class
    const body = page.locator('body')
    await expect(body).toHaveClass(/high-contrast/)
    
    // Toggle off
    await page.getByRole('button', { name: /High Contrast/i }).click()
    await expect(body).not.toHaveClass(/high-contrast/)
  })

  test('should be keyboard navigable', async ({ page }) => {
    // Use Tab to navigate
    await page.keyboard.press('Tab')
    await page.keyboard.press('Tab')
    
    // Generate schedule with Enter key
    await page.keyboard.press('Enter')
    await expect(page.getByText('Race Schedule')).toBeVisible()
    
    // Navigate to start race button
    await page.keyboard.press('Tab')
    await page.keyboard.press('Enter')
    
    // Check race started
    await expect(page.getByText('Current Round:')).toBeVisible()
  })

  test('should have proper ARIA labels', async ({ page }) => {
    // Check main landmark
    const main = page.getByRole('main', { name: 'Horse Racing Game' })
    await expect(main).toBeVisible()
    
    // Check toolbar
    const toolbar = page.getByRole('toolbar', { name: 'Race controls' })
    await expect(toolbar).toBeVisible()
    
    // Generate schedule to check more elements
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    
    // Check race schedule region
    const scheduleRegion = page.getByRole('region', { name: /Race Schedule/i })
    await expect(scheduleRegion).toBeVisible()
  })

  test('should announce race status to screen readers', async ({ page }) => {
    // Generate and start race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Check live region exists
    const liveRegion = page.locator('[aria-live="polite"]')
    await expect(liveRegion).toBeVisible()
    
    // Check status announcements
    const statusElement = page.locator('[role="status"]')
    await expect(statusElement).toBeVisible()
  })
})

test.describe('Sound Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle sound on and off', async ({ page }) => {
    // Click sound toggle
    await page.getByRole('button', { name: /Sound/i }).click()
    
    // Sound should be disabled (button text changes)
    await expect(page.getByRole('button', { name: /Sound.*Off/i })).toBeVisible()
    
    // Toggle back on
    await page.getByRole('button', { name: /Sound.*Off/i }).click()
    await expect(page.getByRole('button', { name: /Sound.*On/i })).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test')
    
    await page.goto('/')
    
    // Check main elements are still visible on mobile
    await expect(page.getByRole('heading', { name: '🏇 Horse Racing Game' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate Schedule/i })).toBeVisible()
    
    // Generate race and check layout
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await expect(page.getByText('Race Schedule')).toBeVisible()
    
    // Check race cards are still accessible
    const raceItems = page.locator('.race-item')
    await expect(raceItems.first()).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '🏇 Horse Racing Game' })).toBeVisible()
    const loadTime = Date.now() - startTime
    
    expect(loadTime).toBeLessThan(3000) // Should load within 3 seconds
  })

  test('should handle race simulation without performance issues', async ({ page }) => {
    await page.goto('/')
    
    // Generate and start race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Monitor for any console errors during race
    const errors: string[] = []
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text())
      }
    })
    
    // Wait for race to progress
    await page.waitForTimeout(5000)
    
    // Should not have critical errors
    expect(errors.filter(e => !e.includes('favicon'))).toHaveLength(0)
  })
})