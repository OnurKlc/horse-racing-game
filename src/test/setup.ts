import { beforeEach } from 'vitest'

// Global test setup
beforeEach(() => {
  // Reset any global state before each test
  document.body.innerHTML = ''
})

// Mock Web Audio API for soundManager tests
Object.defineProperty(window, 'AudioContext', {
  writable: true,
  value: class MockAudioContext {
    createOscillator() {
      return {
        connect: () => {},
        start: () => {},
        stop: () => {},
        frequency: { value: 0 },
        type: 'sine'
      }
    }

    createGain() {
      return {
        connect: () => {},
        gain: { value: 0 }
      }
    }

    get destination() {
      return {}
    }
  }
})

Object.defineProperty(window, 'webkitAudioContext', {
  writable: true,
  value: window.AudioContext
})
