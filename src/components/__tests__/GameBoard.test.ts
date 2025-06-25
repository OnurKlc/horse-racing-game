import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import GameBoard from '../GameBoard.vue'
import type { RootState } from '@/types'

const mockStore = createStore({
  state: {
    horses: [],
    raceSchedule: [],
    currentRaceHorses: [],
    currentRound: 0,
    isRacing: false,
    isPaused: false,
    isWaitingBetweenRounds: false,
    raceCompleted: false,
    raceResults: [],
    soundEnabled: true,
    showConfetti: false,
    lastWinner: null
  } as RootState,
  mutations: {
    GENERATE_RACE_SCHEDULE: vi.fn(),
    SET_RACING_STATUS: vi.fn(),
    SET_PAUSED_STATUS: vi.fn(),
    TOGGLE_SOUND: vi.fn()
  },
  actions: {
    generateRaceSchedule: vi.fn(),
    startRace: vi.fn(),
    pauseRace: vi.fn(),
    toggleSound: vi.fn(),
    hideConfetti: vi.fn()
  },
  getters: {
    hasSchedule: () => false,
    currentRaceData: () => null
  }
})

describe('GameBoard', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(GameBoard, {
      global: {
        plugins: [mockStore]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('rendering', () => {
    it('should render the component', () => {
      expect(wrapper.find('.game-board').exists()).toBe(true)
    })

    it('should show generate schedule button when no schedule exists', () => {
      expect(wrapper.find('button').exists()).toBe(true)
      expect(wrapper.find('button').text()).toContain('Generate Schedule')
    })

    it('should show high contrast toggle button', () => {
      expect(wrapper.find('.btn-contrast').exists()).toBe(true)
    })

    it('should show sound toggle button', () => {
      expect(wrapper.find('.btn-sound').exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should have screen reader instructions', () => {
      expect(wrapper.find('[aria-live="polite"]').exists()).toBe(true)
    })

    it('should handle keyboard navigation', async () => {
      const button = wrapper.find('button')
      const spy = vi.spyOn(wrapper.vm, 'generateSchedule')

      await button.trigger('keydown', { key: 'Enter' })
      expect(spy).toHaveBeenCalled()
    })
  })

  describe('user interactions', () => {
    it('should generate new race when button clicked', async () => {
      const generateButton = wrapper.find('button')
      const spy = vi.spyOn(mockStore, 'dispatch')

      await generateButton.trigger('click')
      expect(spy).toHaveBeenCalledWith('generateRaceSchedule')
    })

    it('should toggle high contrast mode', async () => {
      const contrastButton = wrapper.find('.btn-contrast')

      await contrastButton.trigger('click')
      expect(wrapper.vm.highContrast).toBe(true)
      expect(document.body.classList.contains('high-contrast')).toBe(true)

      await contrastButton.trigger('click')
      expect(wrapper.vm.highContrast).toBe(false)
      expect(document.body.classList.contains('high-contrast')).toBe(false)
    })

    it('should toggle sound settings', async () => {
      const soundButton = wrapper.find('.btn-sound')
      const spy = vi.spyOn(mockStore, 'dispatch')

      await soundButton.trigger('click')
      expect(spy).toHaveBeenCalledWith('toggleSound', expect.any(Object))
    })
  })

  describe('race controls', () => {
    it('should have computed property for schedule check', () => {
      // Test the hasSchedule computed property
      expect(wrapper.vm.hasSchedule).toBe(false) // mockStore has empty raceSchedule
    })

    it('should render different buttons based on state', () => {
      // Should always have generate schedule button
      expect(wrapper.find('.btn-primary').exists()).toBe(true)

      // Should have sound toggle button
      expect(wrapper.find('.btn-sound').exists()).toBe(true)

      // Should have contrast toggle button
      expect(wrapper.find('.btn-contrast').exists()).toBe(true)
    })
  })

  describe('screen reader announcements', () => {
    it('should announce race status changes', () => {
      const liveRegion = wrapper.find('[aria-live="assertive"]')
      expect(liveRegion.exists()).toBe(true)
    })
  })

  describe('global keyboard navigation', () => {
    beforeEach(() => {
      // Mock DOM methods
      ;(globalThis as any).document.querySelectorAll = vi.fn()
    })

    afterEach(() => {
      vi.restoreAllMocks()
    })

    it('should handle ArrowRight navigation', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockButtons[1].focus).toHaveBeenCalled()
      expect(wrapper.vm.focusedButtonIndex).toBe(1)
    })

    it('should handle ArrowDown navigation', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)

      const event = new KeyboardEvent('keydown', { key: 'ArrowDown' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockButtons[1].focus).toHaveBeenCalled()
    })

    it('should handle ArrowLeft navigation', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)
      wrapper.vm.focusedButtonIndex = 1

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockButtons[0].focus).toHaveBeenCalled()
      expect(wrapper.vm.focusedButtonIndex).toBe(0)
    })

    it('should handle ArrowUp navigation', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)
      wrapper.vm.focusedButtonIndex = 1

      const event = new KeyboardEvent('keydown', { key: 'ArrowUp' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockButtons[0].focus).toHaveBeenCalled()
    })

    it('should wrap around when navigating past end', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)
      wrapper.vm.focusedButtonIndex = 1

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      wrapper.vm.handleGlobalKeydown(event)

      expect(mockButtons[0].focus).toHaveBeenCalled()
      expect(wrapper.vm.focusedButtonIndex).toBe(0)
    })

    it('should wrap around when navigating past beginning', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)
      wrapper.vm.focusedButtonIndex = 0

      const event = new KeyboardEvent('keydown', { key: 'ArrowLeft' })
      wrapper.vm.handleGlobalKeydown(event)

      expect(mockButtons[1].focus).toHaveBeenCalled()
      expect(wrapper.vm.focusedButtonIndex).toBe(1)
    })

    it('should handle Home key navigation', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)
      wrapper.vm.focusedButtonIndex = 2

      const event = new KeyboardEvent('keydown', { key: 'Home' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockButtons[0].focus).toHaveBeenCalled()
      expect(wrapper.vm.focusedButtonIndex).toBe(0)
    })

    it('should handle End key navigation', () => {
      const mockButtons = [{ focus: vi.fn() }, { focus: vi.fn() }, { focus: vi.fn() }] as any[]

      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)
      wrapper.vm.focusedButtonIndex = 0

      const event = new KeyboardEvent('keydown', { key: 'End' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).toHaveBeenCalled()
      expect(mockButtons[2].focus).toHaveBeenCalled()
      expect(wrapper.vm.focusedButtonIndex).toBe(2)
    })

    it('should handle Escape key navigation', () => {
      const mockButtons = [{ focus: vi.fn() }] as any[]
      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)

      const mockActiveElement = { blur: vi.fn() }

      // Use vi.spyOn to mock document.activeElement getter
      const activeElementSpy = vi.spyOn(document, 'activeElement', 'get')
      activeElementSpy.mockReturnValue(mockActiveElement as any)

      const event = new KeyboardEvent('keydown', { key: 'Escape' })
      wrapper.vm.handleGlobalKeydown(event)

      expect(mockActiveElement.blur).toHaveBeenCalled()

      activeElementSpy.mockRestore()
    })

    it('should handle Tab key without preventing default', () => {
      const mockButtons = [{ focus: vi.fn() }] as any[]
      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)

      const event = new KeyboardEvent('keydown', { key: 'Tab' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('should do nothing when no buttons are available', () => {
      ;(document.querySelectorAll as any).mockReturnValue([])

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      const preventDefaultSpy = vi.spyOn(event, 'preventDefault')

      wrapper.vm.handleGlobalKeydown(event)

      expect(preventDefaultSpy).not.toHaveBeenCalled()
    })

    it('should handle single button navigation', () => {
      const mockButtons = [{ focus: vi.fn() }] as any[]
      ;(document.querySelectorAll as any).mockReturnValue(mockButtons)

      const event = new KeyboardEvent('keydown', { key: 'ArrowRight' })
      wrapper.vm.handleGlobalKeydown(event)

      expect(mockButtons[0].focus).toHaveBeenCalled()
      expect(wrapper.vm.focusedButtonIndex).toBe(0)
    })
  })

  describe('lifecycle methods', () => {
    it('should add event listener on mount', () => {
      const addEventListenerSpy = vi.spyOn(document, 'addEventListener')

      const newWrapper = mount(GameBoard, {
        global: {
          plugins: [mockStore]
        }
      })

      expect(addEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))

      newWrapper.unmount()
      addEventListenerSpy.mockRestore()
    })

    it('should remove event listener on unmount', () => {
      const removeEventListenerSpy = vi.spyOn(document, 'removeEventListener')

      const newWrapper = mount(GameBoard, {
        global: {
          plugins: [mockStore]
        }
      })

      newWrapper.unmount()

      expect(removeEventListenerSpy).toHaveBeenCalledWith('keydown', expect.any(Function))
      removeEventListenerSpy.mockRestore()
    })
  })
})
