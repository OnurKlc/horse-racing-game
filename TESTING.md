# Testing Guide

This document provides comprehensive information about the testing strategy and how to run tests for the Horse Racing Game.

## Testing Strategy Overview

Our testing strategy includes multiple layers:

1. **Unit Tests** - Test individual functions and utilities
2. **Component Tests** - Test Vue components in isolation
3. **Integration Tests** - Test component interactions
4. **End-to-End Tests** - Test complete user workflows
5. **Accessibility Tests** - Ensure WCAG compliance

## Test Framework Stack

- **Unit/Component Testing**: [Vitest](https://vitest.dev/) + [Vue Test Utils](https://test-utils.vuejs.org/)
- **E2E Testing**: [Playwright](https://playwright.dev/)
- **Coverage**: V8 provider via Vitest
- **CI/CD**: GitHub Actions

## Running Tests

### Unit and Component Tests

```bash
# Run tests in watch mode (development)
npm run test

# Run tests once
npm run test:run

# Run tests with coverage
npm run test:coverage

# Run tests with UI
npm run test:ui
```

### End-to-End Tests

```bash
# Run E2E tests (headless)
npm run test:e2e

# Run E2E tests with UI
npm run test:e2e:ui

# Run E2E tests in headed mode (visible browser)
npm run test:e2e:headed
```

### Accessibility Tests

```bash
# Run accessibility-specific tests
npx playwright test tests/e2e/accessibility.spec.ts

# Run with specific browser
npx playwright test tests/e2e/accessibility.spec.ts --project=chromium
```

## Test Structure

### Unit Tests

Located in `src/**/__tests__/` directories:

- `src/utils/__tests__/soundManager.test.ts` - Sound manager utility tests
- `src/store/__tests__/index.test.ts` - Vuex store tests

### Component Tests

Located in `src/components/__tests__/`:

- `GameBoard.test.ts` - Main game board component
- `ConfettiEffect.test.ts` - Confetti animation component

### E2E Tests

Located in `tests/e2e/`:

- `horse-racing-game.spec.ts` - Main user workflows
- `accessibility.spec.ts` - Accessibility compliance tests

## What We Test

### Unit Tests Cover:

- **Sound Manager**: Audio context handling, sound playback, enable/disable functionality
- **Vuex Store**: State mutations, actions, getters, race simulation logic
- **Utility Functions**: Pure functions and business logic

### Component Tests Cover:

- **Rendering**: Component appears correctly
- **User Interactions**: Button clicks, form inputs
- **Props and Events**: Component communication
- **Accessibility**: ARIA attributes, keyboard navigation

### E2E Tests Cover:

- **Complete User Workflows**: Generate schedule → Start race → View results
- **Cross-browser Compatibility**: Chrome, Firefox, Safari, Mobile
- **Race Simulation**: Pause/resume, multiple rounds
- **Performance**: Load times, race rendering

### Accessibility Tests Cover:

- **Keyboard Navigation**: Tab order, arrow keys, Enter/Space activation
- **Screen Reader Support**: ARIA labels, live regions, announcements
- **High Contrast Mode**: Color contrast, visibility
- **Focus Management**: Focus indicators, focus trapping
- **Semantic HTML**: Proper heading hierarchy, landmarks

## Coverage Goals

We aim for:

- **Line Coverage**: >80%
- **Function Coverage**: >90%
- **Branch Coverage**: >75%

Current coverage can be viewed by running `npm run test:coverage` and opening `coverage/index.html`.

## CI/CD Pipeline

Our GitHub Actions workflow runs:

1. **Linting** - ESLint code quality checks
2. **Type Checking** - TypeScript compilation
3. **Unit Tests** - Jest/Vitest with coverage
4. **E2E Tests** - Playwright across multiple browsers
5. **Accessibility Tests** - Dedicated a11y test suite
6. **Security Scanning** - npm audit for vulnerabilities
7. **Build Verification** - Production build testing

## Test Best Practices

### Unit Tests

```typescript
// Good: Test behavior, not implementation
it('should play sound when enabled', () => {
  soundManager.setEnabled(true)
  soundManager.playHorseGallop()
  expect(mockOscillator.start).toHaveBeenCalled()
})

// Good: Test edge cases
it('should handle missing AudioContext gracefully', () => {
  delete window.AudioContext
  expect(() => soundManager.playSound('gallop')).not.toThrow()
})
```

### Component Tests

```typescript
// Good: Test user interactions
it('should start race when button clicked', async () => {
  const startButton = wrapper.find('[aria-label="Start race"]')
  await startButton.trigger('click')
  expect(mockStore.dispatch).toHaveBeenCalledWith('startRace')
})

// Good: Test accessibility
it('should have proper ARIA labels', () => {
  const main = wrapper.find('[role="main"]')
  expect(main.attributes('aria-label')).toBe('Horse Racing Game')
})
```

### E2E Tests

```typescript
// Good: Test complete workflows
test('should complete full race workflow', async ({ page }) => {
  await page.getByRole('button', { name: /Generate Schedule/i }).click()
  await page.getByRole('button', { name: /Start Race/i }).click()
  await expect(page.getByText('Race Results')).toBeVisible({ timeout: 30000 })
})

// Good: Test across devices
test('should work on mobile', async ({ page, isMobile }) => {
  test.skip(!isMobile, 'Mobile-specific test')
  // Mobile-specific testing
})
```

## Debugging Tests

### Unit Tests

```bash
# Debug specific test
npm run test -- --reporter=verbose soundManager

# Debug with breakpoints
npm run test -- --inspect-brk
```

### E2E Tests

```bash
# Debug mode with browser visible
npx playwright test --debug

# Headed mode
npx playwright test --headed

# Specific test file
npx playwright test tests/e2e/horse-racing-game.spec.ts --debug
```

## Test Data and Mocks

### Mock Setup

We mock external dependencies in `src/test/setup.ts`:

- **AudioContext** for sound testing
- **Performance APIs** for timing tests
- **DOM APIs** as needed

### Test Fixtures

E2E tests use Playwright's built-in fixtures for:

- Browser contexts
- Page objects
- Device emulation
- Network conditions

## Accessibility Testing Tools

We use multiple approaches:

1. **Manual Testing**: Keyboard navigation, screen reader testing
2. **Automated Testing**: Playwright accessibility checks
3. **Visual Testing**: High contrast mode verification
4. **Performance Testing**: Reduced motion preferences

## Continuous Integration

Tests run automatically on:

- **Pull Requests** - Full test suite
- **Main Branch Pushes** - Full suite + deployment
- **Nightly** - Extended test suite with performance benchmarks

## Local Development

For the best development experience:

1. Run unit tests in watch mode: `npm run test`
2. Keep E2E tests running for critical paths: `npm run test:e2e:ui`
3. Use test coverage to identify gaps: `npm run test:coverage`
4. Test accessibility features manually with screen readers

## Reporting Issues

When reporting test failures:

1. Include the full test command and output
2. Specify browser/environment details
3. Attach screenshots for E2E test failures
4. Include coverage reports if relevant

## Contributing Tests

When adding new features:

1. Write unit tests for utilities/functions
2. Add component tests for Vue components
3. Include E2E tests for user-facing features
4. Test accessibility if UI changes are involved
5. Update this documentation if needed

## Performance Benchmarks

We track performance metrics:

- **Initial Load Time**: <3 seconds
- **Race Start Delay**: <500ms
- **Animation Frame Rate**: 60fps target
- **Memory Usage**: <50MB during race

Run performance tests with:

```bash
npx playwright test --grep="Performance"
```
