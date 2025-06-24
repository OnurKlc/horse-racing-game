import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import GameBoard from '../GameBoard.vue'
import type { RootState } from '@/store'

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
    winnerHorse: null
  } as RootState,
  mutations: {
    GENERATE_HORSES: vi.fn(),
    GENERATE_RACE_SCHEDULE: vi.fn(),
    START_RACING: vi.fn(),
    PAUSE_RACING: vi.fn(),
    RESUME_RACING: vi.fn(),
    STOP_RACING: vi.fn()
  },
  actions: {
    generateNewRace: vi.fn(),
    startRace: vi.fn(),
    pauseRace: vi.fn(),
    resumeRace: vi.fn(),
    stopRace: vi.fn()
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

  describe('rendering', () => {
    it('should render the component', () => {
      expect(wrapper.exists()).toBe(true)
      expect(wrapper.find('h1').text()).toBe('🏇 Horse Racing Game')
    })

    it('should show generate schedule button when no schedule exists', () => {
      const generateButton = wrapper.find('[aria-label="Generate new race schedule"]')
      expect(generateButton.exists()).toBe(true)
      expect(generateButton.text()).toContain('Generate Schedule')
    })

    it('should show high contrast toggle button', () => {
      const contrastButton = wrapper.find(
        '[aria-label="Toggle high contrast mode for better accessibility"]'
      )
      expect(contrastButton.exists()).toBe(true)
    })

    it('should show sound toggle button', () => {
      const soundButton = wrapper.find('[aria-label="Toggle sound effects on or off"]')
      expect(soundButton.exists()).toBe(true)
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels', () => {
      const mainElement = wrapper.find('[role="main"]')
      expect(mainElement.exists()).toBe(true)
      expect(mainElement.attributes('aria-label')).toBe('Horse Racing Game')

      const toolbar = wrapper.find('[role="toolbar"]')
      expect(toolbar.exists()).toBe(true)
      expect(toolbar.attributes('aria-label')).toBe('Race controls')
    })

    it('should have screen reader instructions', () => {
      const instructions = wrapper.find('#game-instructions')
      expect(instructions.exists()).toBe(true)
      expect(instructions.text()).toContain('Horse racing game controls')
    })

    it('should handle keyboard navigation', async () => {
      const generateButton = wrapper.find('[aria-label="Generate new race schedule"]')

      await generateButton.trigger('keydown', { key: 'Enter' })
      expect(mockStore.dispatch).toHaveBeenCalledWith('generateNewRace')
    })
  })

  describe('user interactions', () => {
    it('should generate new race when button clicked', async () => {
      const generateButton = wrapper.find('[aria-label="Generate new race schedule"]')
      await generateButton.trigger('click')

      expect(mockStore.dispatch).toHaveBeenCalledWith('generateNewRace')
    })

    it('should toggle high contrast mode', async () => {
      const contrastButton = wrapper.find(
        '[aria-label="Toggle high contrast mode for better accessibility"]'
      )
      await contrastButton.trigger('click')

      expect(document.body.classList.contains('high-contrast')).toBe(true)

      await contrastButton.trigger('click')
      expect(document.body.classList.contains('high-contrast')).toBe(false)
    })

    it('should toggle sound settings', async () => {
      const soundButton = wrapper.find('[aria-label="Toggle sound effects on or off"]')

      // Initial state should be enabled
      expect(wrapper.vm.soundEnabled).toBe(true)

      await soundButton.trigger('click')
      expect(wrapper.vm.soundEnabled).toBe(false)

      await soundButton.trigger('click')
      expect(wrapper.vm.soundEnabled).toBe(true)
    })
  })

  describe('race controls', () => {
    beforeEach(() => {
      // Mock having a schedule
      mockStore.getters.hasSchedule = () => true
      mockStore.getters.currentRaceData = () => ({
        round: 1,
        distance: 1000,
        horses: []
      })
    })

    it('should show start race button when schedule exists and not racing', async () => {
      await wrapper.vm.$nextTick()

      const startButton = wrapper.find('[aria-label="Start the current race"]')
      expect(startButton.exists()).toBe(true)
    })

    it('should start race when start button clicked', async () => {
      const startButton = wrapper.find('[aria-label="Start the current race"]')
      await startButton.trigger('click')

      expect(mockStore.dispatch).toHaveBeenCalledWith('startRace')
    })
  })

  describe('screen reader announcements', () => {
    it('should have live region for announcements', () => {
      const liveRegion = wrapper.find('[aria-live="polite"]')
      expect(liveRegion.exists()).toBe(true)
    })

    it('should announce race status changes', async () => {
      const announcement = wrapper.find('#race-status-announcement')
      expect(announcement.exists()).toBe(true)
    })
  })

  describe('responsive design', () => {
    it('should have responsive CSS classes', () => {
      const gameBoard = wrapper.find('.game-board')
      expect(gameBoard.exists()).toBe(true)

      const controls = wrapper.find('.controls')
      expect(controls.exists()).toBe(true)
    })
  })
})
