# 🐎 Horse Racing Game

An interactive horse racing game built with Vue.js, featuring animated races, real-time results, and professional development practices.

## 🎯 Features

- **Interactive Racing**: Watch 10 horses compete in 6 rounds with different distances
- **Real-time Animation**: Smooth horse movement with circular badges and finish line animations
- **Smart Race Logic**: Balanced speed calculations with surprise factors and fatigue simulation
- **Pause/Resume**: Control race progression with pause functionality
- **Detailed Results**: Podium-style winners display with comprehensive race statistics
- **Responsive Design**: Full-width layout optimized for various screen sizes
- **State Management**: Centralized Vuex store for all race data

## 🏁 Race System

### Race Structure

- **6 Rounds** with increasing distances: 1200m, 1400m, 1600m, 1800m, 2000m, 2200m
- **10 Random Horses** selected per round from a pool of 20 unique horses
- **Time-based Results** with accurate finish position calculation

### Horse Features

- **20 Unique Horses** with distinct colors and condition scores (1-100)
- **Dynamic Performance**: Condition affects speed but doesn't guarantee victory
- **Surprise Elements**: Random bursts and late-race fatigue for exciting outcomes

## 🚀 Quick Start

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Build for production
npm run build

# Preview production build
npm run preview
```

## 🛠️ Development Tools

This project includes a comprehensive development toolchain:

```bash
# Code Quality
npm run lint          # ESLint with auto-fix
npm run lint:check     # ESLint check only
npm run format         # Prettier formatting
npm run format:check   # Prettier check only

# Git Hooks (automatically run on commit)
# - ESLint auto-fix
# - Prettier formatting
# - Staged files only
```

## 🏗️ Tech Stack

- **Vue 3** - Modern reactive framework with Composition API
- **Vuex 4** - Centralized state management
- **Vite** - Fast build tool and dev server
- **ESLint** - Code linting with Vue.js rules
- **Prettier** - Code formatting
- **Husky** - Git hooks for code quality
- **lint-staged** - Run linters on staged files only

## 📁 Project Structure

```
src/
├── components/
│   ├── GameBoard.vue     # Main game controls and layout
│   ├── HorseList.vue     # Display all available horses
│   ├── RaceInfo.vue      # Current race status and completion
│   ├── RaceSchedule.vue  # Schedule overview with horse lists
│   ├── RaceTrack.vue     # Animated race visualization
│   └── Results.vue       # Race results with podium display
├── store/
│   └── index.js          # Vuex store with race logic
├── assets/
│   ├── base.css         # Base styles and resets
│   └── main.css         # Global application styles
└── main.js              # Application entry point
```

## 🎮 How to Play

1. **Generate Schedule**: Click "Generate Schedule" to create a new race series
2. **Start Racing**: Click "Start Race" to begin the 6-round competition
3. **Control Playback**: Use "Pause/Resume" to control race progression
4. **View Results**: Check the podium and detailed results after each round
5. **New Series**: Generate a new schedule after all rounds complete

## 🏆 Race Features

### Visual Indicators

- **Gold/Silver/Bronze** horse info boxes for 1st/2nd/3rd place finishers
- **Real-time Position** tracking with smooth animations
- **Finish Line** celebrations with color-coded results

### Performance Factors

- **Base Speed**: Derived from horse condition (35% influence)
- **Random Variance**: 65% randomness for unpredictable outcomes
- **Surprise Bursts**: 10% chance of extra speed boosts
- **Late Fatigue**: Slowdown potential in final 30% of race

## 🔧 Code Quality Standards

- **ESLint Rules**: Vue.js best practices with custom configuration
- **Prettier Formatting**: Consistent code style across all files
- **Git Hooks**: Automatic linting and formatting on commits
- **Zero Unused Code**: Clean, optimized codebase
- **Modern JavaScript**: ES6+ features with proper error handling

## 🎨 Design Principles

- **Component-Based**: Modular Vue components with single responsibilities
- **State-Driven**: Centralized state management with reactive updates
- **User Experience**: Smooth animations and clear visual feedback
- **Accessibility**: Semantic HTML and proper contrast ratios
- **Performance**: Optimized build with minimal bundle size

## 📊 Performance Metrics

- **Bundle Size**: ~86KB JS, ~12KB CSS (gzipped: ~32KB JS, ~3KB CSS)
- **Build Time**: <1 second
- **Lighthouse Score**: Optimized for performance and best practices
- **Zero Linting Errors**: Clean, maintainable codebase

---

**Built with ❤️ for frontend development excellence**
