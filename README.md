# Horse Racing Game

An interactive horse racing game built with Vue.js 3, TypeScript, and modern web technologies. Features comprehensive accessibility support, sound effects, animations, and professional development practices.

![Lighthouse Performance](https://img.shields.io/badge/Lighthouse-Performance%20100-brightgreen)
![Lighthouse Accessibility](https://img.shields.io/badge/Lighthouse-Accessibility%2094-brightgreen)
![Lighthouse Best Practices](https://img.shields.io/badge/Lighthouse-Best%20Practices%20100-brightgreen)
![Lighthouse SEO](https://img.shields.io/badge/Lighthouse-SEO%2083-yellow)

## Quick Start

```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run test         # Run tests
```

## Key Features

- **Interactive Racing**: 6 rounds with 10 horses, real-time animations, pause/resume controls
- **Accessibility**: WCAG 2.1 AA compliant with keyboard navigation, screen readers, high contrast mode
- **Sound Effects**: Race audio with Web Audio API and toggle controls
- **TypeScript**: Full type safety across components and store
- **Testing**: Unit, component, and E2E tests with 70% overall coverage (96% components)
- **Performance**: 100/100 Lighthouse score, ~41KB gzipped bundle

## Available Scripts

```bash
# Development
npm run dev           # Vite dev server with hot reload
npm run build         # Production build with TypeScript
npm run preview       # Preview production build
npm run type-check    # TypeScript compilation check

# Code Quality
npm run lint          # ESLint with auto-fix
npm run format        # Prettier formatting

# Testing
npm run test          # Unit tests (Vitest)
npm run test:coverage # Test coverage report
npm run test:e2e      # End-to-end tests (Playwright)
npm run test:e2e:ui   # E2E tests with UI
```

## 🏗Tech Stack

**Core**: Vue 3, TypeScript, Vuex 4, Vite  
**Testing**: Vitest, Playwright, Vue Test Utils  
**Quality**: ESLint, Prettier, Husky, lint-staged  
**CI/CD**: GitHub Actions with automated testing and deployment

## Performance Metrics

- **Bundle Size**: 103KB JS, 23KB CSS (~41KB gzipped total)
- **Lighthouse**: 100 Performance, 94 Accessibility, 100 Best Practices
- **Load Times**: 0.4s First/Largest Contentful Paint
- **Build Time**: <1 second

## Accessibility Features

- **WCAG 2.1 AA Compliant**: Keyboard navigation, screen readers, ARIA labels
- **High Contrast Mode**: Toggle for enhanced visibility
- **Focus Management**: Clear indicators and logical tab order
- **Live Announcements**: Race status updates for screen readers

## Testing Strategy

**Unit Tests**: Sound manager, Vuex store, component logic (206 tests)  
**Component Tests**: User interactions, accessibility features, keyboard navigation  
**E2E Tests**: Cross-browser workflows, WCAG compliance, performance  
**Coverage**: 70% overall, 96% components, 92% utils, 85% branches

**Detailed Coverage by Component:**

- HorseList, RaceTrack, Results, RaceSchedule: 100% coverage
- GameBoard: 93% coverage with full keyboard navigation
- ConfettiEffect: 100% statements, 85% functions
- Sound Manager: 92% coverage with Web Audio API testing

## Project Structure

```
src/
├── components/           # Vue components with TypeScript
├── store/               # Vuex store with type definitions
├── utils/               # Sound manager and utilities
├── assets/              # Global CSS and high contrast theme
└── types/               # TypeScript interfaces

tests/
├── unit/                # Component and utility tests
└── e2e/                 # Playwright browser tests

.github/workflows/       # CI/CD pipeline
```

## How to Play

1. **Generate Schedule** → **Start Race** → **Control with Pause/Resume**
2. **Toggle Features**: Sound effects and high contrast mode
3. **View Results**: Podium display and detailed race statistics

## CI/CD Pipeline

Automated GitHub Actions workflow:

- Multi-version Node.js testing (18, 20)
- TypeScript compilation and ESLint analysis
- Unit and E2E test execution with coverage
- Accessibility compliance verification
- Automated deployment to GitHub Pages
