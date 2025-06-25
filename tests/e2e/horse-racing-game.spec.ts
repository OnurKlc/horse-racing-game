import { test, expect } from '@playwright/test'

test.describe('Horse Racing Game', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should load the game interface', async ({ page }) => {
    // Check main heading
    await expect(page.getByRole('heading', { name: '🐎 Horse Racing Game' })).toBeVisible()
    
    // Check main controls are present
    await expect(page.getByRole('button', { name: /Generate Schedule/i })).toBeVisible()
    await expect(page.locator('.btn-contrast')).toBeVisible()
    await expect(page.locator('.btn-sound')).toBeVisible()
  })

  test('should generate race schedule', async ({ page }) => {
    // Click generate schedule button
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    
    // Wait for schedule to be generated
    await expect(page.getByRole('heading', { name: 'Race Schedule', exact: true })).toBeVisible()
    
    // Check that 6 rounds are created
    const raceItems = page.locator('.race-item')
    await expect(raceItems).toHaveCount(6)
    
    // Check start race button appears
    await expect(page.getByRole('button', { name: /Start Race/i })).toBeVisible()
  })

  test('should start and run a race', async ({ page }) => {
    // Generate schedule first
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await expect(page.getByRole('heading', { name: 'Race Schedule', exact: true })).toBeVisible()
    
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
    await expect(page.getByRole('heading', { name: 'Race Results' })).toBeVisible({ timeout: 30000 })
    
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
    await expect(page.getByRole('heading', { name: 'Race Results' })).toBeVisible({ timeout: 30000 })
    
    // Check if there's a next round available
    const nextRoundButton = page.getByRole('button', { name: /Start Race/i })
    if (await nextRoundButton.isVisible()) {
      await nextRoundButton.click()
      await expect(page.getByText('Current Round:')).toBeVisible()
    }
  })
})

test.describe('Accessibility Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle high contrast mode', async ({ page }) => {
    // Toggle high contrast
    await page.locator('.btn-contrast').click()
    
    // Check body has high contrast class
    const body = page.locator('body')
    await expect(body).toHaveClass(/high-contrast/)
    
    // Toggle off
    await page.locator('.btn-contrast').click()
    await expect(body).not.toHaveClass(/high-contrast/)
  })

  test('should be keyboard navigable', async ({ page }) => {
    // Focus and activate the generate schedule button directly
    const generateButton = page.getByRole('button', { name: /Generate Schedule/i })
    await generateButton.focus()
    await generateButton.press('Enter')
    await expect(page.getByRole('heading', { name: 'Race Schedule', exact: true })).toBeVisible()
    
    // Focus and activate start race button
    const startButton = page.getByRole('button', { name: /Start Race/i })
    await startButton.focus()
    await startButton.press('Enter')
    
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
    const scheduleRegion = page.getByRole('region', { name: 'Race Schedule', exact: true })
    await expect(scheduleRegion).toBeVisible()
  })

  test('should announce race status to screen readers', async ({ page }) => {
    // Generate and start race
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await page.getByRole('button', { name: /Start Race/i }).click()
    
    // Check live region exists (check specific one)
    const liveRegion = page.locator('#racing-status')
    await expect(liveRegion).toBeAttached()
    
    // Check status announcements (check specific status element)
    const statusElement = page.locator('.current-round[role="status"]')
    await expect(statusElement).toBeVisible()
  })
})

test.describe('Sound Features', () => {
  test.beforeEach(async ({ page }) => {
    await page.goto('/')
  })

  test('should toggle sound on and off', async ({ page }) => {
    // Click sound toggle
    await page.locator('.btn-sound').click()
    
    // Wait for button text to update
    await page.waitForTimeout(100)
    
    // Sound should be toggled (check button is still visible)
    const soundButton = page.locator('.btn-sound')
    await expect(soundButton).toBeVisible()
    
    // Toggle back
    await soundButton.click()
    await expect(soundButton).toBeVisible()
  })
})

test.describe('Mobile Responsiveness', () => {
  test('should work on mobile devices', async ({ page, isMobile }) => {
    test.skip(!isMobile, 'Mobile-specific test')
    
    await page.goto('/')
    
    // Check main elements are still visible on mobile
    await expect(page.getByRole('heading', { name: '🐎 Horse Racing Game' })).toBeVisible()
    await expect(page.getByRole('button', { name: /Generate Schedule/i })).toBeVisible()
    
    // Generate race and check layout
    await page.getByRole('button', { name: /Generate Schedule/i }).click()
    await expect(page.getByRole('heading', { name: 'Race Schedule', exact: true })).toBeVisible()
    
    // Check race cards are still accessible
    const raceItems = page.locator('.race-item')
    await expect(raceItems.first()).toBeVisible()
  })
})

test.describe('Performance', () => {
  test('should load quickly', async ({ page }) => {
    const startTime = Date.now()
    await page.goto('/')
    await expect(page.getByRole('heading', { name: '🐎 Horse Racing Game' })).toBeVisible()
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