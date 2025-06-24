import { describe, it, expect, beforeEach, vi } from 'vitest'
import { soundManager } from '../soundManager'

describe('soundManager', () => {
  beforeEach(() => {
    // Reset sound manager state
    soundManager.setEnabled(true)
    vi.clearAllMocks()
  })

  describe('initialization', () => {
    it('should initialize with enabled state', () => {
      expect(soundManager.isEnabled()).toBe(true)
    })

    it('should handle missing AudioContext gracefully', () => {
      const originalAudioContext = window.AudioContext
      // @ts-ignore
      delete window.AudioContext
      // @ts-ignore
      delete window.webkitAudioContext

      expect(() => {
        soundManager.playSound('gallop', 440, 0.1, 1000)
      }).not.toThrow()

      // Restore
      window.AudioContext = originalAudioContext
    })
  })

  describe('enable/disable functionality', () => {
    it('should enable and disable sound', () => {
      soundManager.setEnabled(false)
      expect(soundManager.isEnabled()).toBe(false)

      soundManager.setEnabled(true)
      expect(soundManager.isEnabled()).toBe(true)
    })

    it('should not play sounds when disabled', () => {
      soundManager.setEnabled(false)

      const createOscillatorSpy = vi.fn()
      const mockContext = {
        createOscillator: createOscillatorSpy,
        createGain: () => ({ connect: vi.fn(), gain: { value: 0 } }),
        destination: {}
      }

      // @ts-ignore
      window.AudioContext = vi.fn(() => mockContext)

      soundManager.playSound('gallop', 440, 0.1, 1000)
      expect(createOscillatorSpy).not.toHaveBeenCalled()
    })
  })

  describe('sound playback', () => {
    it('should play gallop sound with correct parameters', () => {
      const mockOscillator = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: 'sine'
      }

      const mockGain = {
        connect: vi.fn(),
        gain: { value: 0 }
      }

      const mockContext = {
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => mockGain),
        destination: {}
      }

      // @ts-ignore
      window.AudioContext = vi.fn(() => mockContext)

      soundManager.playSound('gallop', 440, 0.1, 1000)

      expect(mockContext.createOscillator).toHaveBeenCalled()
      expect(mockContext.createGain).toHaveBeenCalled()
      expect(mockOscillator.frequency.value).toBe(440)
      expect(mockGain.gain.value).toBe(0.1)
      expect(mockOscillator.start).toHaveBeenCalled()
      expect(mockOscillator.stop).toHaveBeenCalled()
    })

    it('should play cheer sound with correct frequency', () => {
      const mockOscillator = {
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: 'sine'
      }

      const mockContext = {
        createOscillator: vi.fn(() => mockOscillator),
        createGain: vi.fn(() => ({ connect: vi.fn(), gain: { value: 0 } })),
        destination: {}
      }

      // @ts-ignore
      window.AudioContext = vi.fn(() => mockContext)

      soundManager.playSound('cheer', 800, 0.2, 2000)

      expect(mockOscillator.frequency.value).toBe(800)
    })

    it('should handle invalid sound types gracefully', () => {
      expect(() => {
        // @ts-ignore - testing runtime behavior
        soundManager.playSound('invalid', 440, 0.1, 1000)
      }).not.toThrow()
    })
  })

  describe('predefined sounds', () => {
    it('should play horse gallop sound', () => {
      const createOscillatorSpy = vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: 'sine'
      }))

      const mockContext = {
        createOscillator: createOscillatorSpy,
        createGain: vi.fn(() => ({ connect: vi.fn(), gain: { value: 0 } })),
        destination: {}
      }

      // @ts-ignore
      window.AudioContext = vi.fn(() => mockContext)

      soundManager.playHorseGallop()
      expect(createOscillatorSpy).toHaveBeenCalled()
    })

    it('should play finish cheer sound', () => {
      const createOscillatorSpy = vi.fn(() => ({
        connect: vi.fn(),
        start: vi.fn(),
        stop: vi.fn(),
        frequency: { value: 0 },
        type: 'sine'
      }))

      const mockContext = {
        createOscillator: createOscillatorSpy,
        createGain: vi.fn(() => ({ connect: vi.fn(), gain: { value: 0 } })),
        destination: {}
      }

      // @ts-ignore
      window.AudioContext = vi.fn(() => mockContext)

      soundManager.playFinishCheer()
      expect(createOscillatorSpy).toHaveBeenCalled()
    })
  })
})
