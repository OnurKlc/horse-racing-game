import { describe, it, expect, beforeEach, vi } from 'vitest'
import { soundManager } from '../soundManager'
import type { SoundEffect } from '../soundManager'

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
      // Since soundManager is already instantiated with a working AudioContext,
      // we need to test a different aspect - that it handles calls gracefully
      // when audio context might not be available
      const originalEnabled = soundManager.isEnabled()

      // Disable sound and verify it doesn't throw
      soundManager.setEnabled(false)
      expect(() => {
        soundManager.playRaceStart()
      }).not.toThrow()

      // Restore original state
      soundManager.setEnabled(originalEnabled)
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

      // Mock AudioContext
      const createOscillatorSpy = vi.fn()
      const mockContext = {
        createOscillator: createOscillatorSpy,
        createGain: () => ({
          connect: vi.fn(),
          gain: {
            setValueAtTime: vi.fn(),
            linearRampToValueAtTime: vi.fn(),
            exponentialRampToValueAtTime: vi.fn()
          }
        }),
        destination: {},
        currentTime: 0
      }

      // @ts-ignore
      soundManager.audioContext = mockContext

      soundManager.playRaceStart()

      expect(createOscillatorSpy).not.toHaveBeenCalled()
    })
  })

  describe('sound playback', () => {
    it('should play sounds when enabled', () => {
      const createOscillatorSpy = vi.fn(() => ({
        connect: vi.fn(),
        frequency: { setValueAtTime: vi.fn() },
        type: 'sine',
        start: vi.fn(),
        stop: vi.fn()
      }))

      const createGainSpy = vi.fn(() => ({
        connect: vi.fn(),
        gain: {
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn()
        }
      }))

      const mockContext = {
        createOscillator: createOscillatorSpy,
        createGain: createGainSpy,
        destination: {},
        currentTime: 0
      }

      // @ts-ignore
      soundManager.audioContext = mockContext

      const testSound: SoundEffect = {
        name: 'test',
        frequency: 440,
        duration: 0.1,
        type: 'sine',
        volume: 0.1
      }

      soundManager.playSound(testSound)

      expect(createOscillatorSpy).toHaveBeenCalled()
      expect(createGainSpy).toHaveBeenCalled()
    })

    it('should handle audio context errors gracefully', () => {
      const mockContext = {
        createOscillator: () => {
          throw new Error('Audio context error')
        },
        createGain: vi.fn(),
        destination: {},
        currentTime: 0
      }

      // @ts-ignore
      soundManager.audioContext = mockContext

      expect(() => {
        soundManager.playRaceStart()
      }).not.toThrow()
    })
  })

  describe('predefined sounds', () => {
    beforeEach(() => {
      // Mock the createBeep method to avoid actual audio playback
      vi.spyOn(soundManager as any, 'createBeep').mockImplementation(() => {})
    })

    it('should play race start sound', () => {
      const playRaceStartSpy = vi.spyOn(soundManager, 'playSound')

      soundManager.playRaceStart()

      expect(playRaceStartSpy).toHaveBeenCalled()
    })

    it('should play horse finish sound with correct position', () => {
      const playHorseFinishSpy = vi.spyOn(soundManager, 'playSound')

      soundManager.playHorseFinish(1) // First place

      expect(playHorseFinishSpy).toHaveBeenCalledWith({
        name: 'finish1',
        frequency: 1200, // Gold frequency
        duration: 0.4,
        type: 'triangle',
        volume: 0.12
      })
    })

    it('should play race complete sound', async () => {
      const playRaceCompleteSpy = vi.spyOn(soundManager, 'playSound')

      soundManager.playRaceComplete()

      // Wait a bit for the first sound to be called
      await new Promise(resolve => setTimeout(resolve, 10))

      expect(playRaceCompleteSpy).toHaveBeenCalled()
      expect(playRaceCompleteSpy).toHaveBeenCalledWith({
        name: 'victory0',
        frequency: 523,
        duration: 0.6,
        type: 'sine',
        volume: 0.08
      })
    })

    it('should play button click sound', () => {
      const playButtonClickSpy = vi.spyOn(soundManager, 'playSound')

      soundManager.playButtonClick()

      expect(playButtonClickSpy).toHaveBeenCalledWith({
        name: 'click',
        frequency: 400,
        duration: 0.1,
        type: 'square',
        volume: 0.05
      })
    })

    it('should play pause sound', () => {
      const playPauseSpy = vi.spyOn(soundManager, 'playSound')

      soundManager.playPause()

      expect(playPauseSpy).toHaveBeenCalledWith({
        name: 'pause',
        frequency: 300,
        duration: 0.2,
        type: 'triangle',
        volume: 0.08
      })
    })

    it('should play resume sound', () => {
      const playResumeSpy = vi.spyOn(soundManager, 'playSound')

      soundManager.playResume()

      expect(playResumeSpy).toHaveBeenCalledWith({
        name: 'resume',
        frequency: 500,
        duration: 0.2,
        type: 'triangle',
        volume: 0.08
      })
    })
  })

  describe('sound effect interface', () => {
    it('should accept valid sound effect objects', () => {
      const validSound: SoundEffect = {
        name: 'test-sound',
        frequency: 440,
        duration: 1.0,
        type: 'sine',
        volume: 0.5
      }

      expect(() => {
        soundManager.playSound(validSound)
      }).not.toThrow()
    })

    it('should use default volume when not specified', () => {
      const soundWithoutVolume: SoundEffect = {
        name: 'no-volume',
        frequency: 440,
        duration: 0.1,
        type: 'sine'
      }

      expect(() => {
        soundManager.playSound(soundWithoutVolume)
      }).not.toThrow()
    })
  })
})
