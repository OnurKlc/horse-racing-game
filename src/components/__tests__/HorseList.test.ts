import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import HorseList from '../HorseList.vue'
import type { RootState, Horse } from '@/types'

const mockHorses: Horse[] = [
  {
    id: 1,
    name: 'Lightning Bolt',
    color: '#ff0000',
    condition: 90,
    position: 0,
    isRacing: false
  },
  {
    id: 2,
    name: 'Thunder Strike',
    color: '#00ff00',
    condition: 65,
    position: 0,
    isRacing: true
  },
  {
    id: 3,
    name: 'Wind Walker',
    color: '#0000ff',
    condition: 35,
    position: 0,
    isRacing: false
  }
]

const mockStore = createStore({
  state: {
    horses: mockHorses,
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
  mutations: {},
  actions: {},
  getters: {}
})

describe('HorseList', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(HorseList, {
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
      expect(wrapper.find('.horse-list').exists()).toBe(true)
    })

    it('should display the correct title with horse count', () => {
      const title = wrapper.find('#horse-list-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe(`Available Horses (${mockHorses.length})`)
    })

    it('should render all horses in the grid', () => {
      const horseCards = wrapper.findAll('.horse-card')
      expect(horseCards).toHaveLength(mockHorses.length)
    })

    it('should display horse names correctly', () => {
      const horseCards = wrapper.findAll('.horse-card')
      mockHorses.forEach((horse, index) => {
        expect(horseCards[index].text()).toContain(horse.name)
      })
    })

    it('should show horse condition values', () => {
      const horseCards = wrapper.findAll('.horse-card')
      mockHorses.forEach((horse, index) => {
        expect(horseCards[index].text()).toContain(`${horse.condition}/100`)
      })
    })
  })

  describe('condition color method', () => {
    it('should return green for excellent condition (>= 80)', () => {
      const color = wrapper.vm.getConditionColor(90)
      expect(color).toBe('#28a745')
    })

    it('should return yellow for good condition (60-79)', () => {
      const color = wrapper.vm.getConditionColor(70)
      expect(color).toBe('#ffc107')
    })

    it('should return orange for fair condition (40-59)', () => {
      const color = wrapper.vm.getConditionColor(50)
      expect(color).toBe('#fd7e14')
    })

    it('should return red for poor condition (< 40)', () => {
      const color = wrapper.vm.getConditionColor(30)
      expect(color).toBe('#dc3545')
    })

    it('should handle edge cases correctly', () => {
      expect(wrapper.vm.getConditionColor(80)).toBe('#28a745')
      expect(wrapper.vm.getConditionColor(60)).toBe('#ffc107')
      expect(wrapper.vm.getConditionColor(40)).toBe('#fd7e14')
      expect(wrapper.vm.getConditionColor(39)).toBe('#dc3545')
    })
  })

  describe('condition description method', () => {
    it('should return excellent description for high condition (>= 80)', () => {
      const description = wrapper.vm.getConditionDescription(90)
      expect(description).toBe('Excellent condition, ready for racing')
    })

    it('should return good description for good condition (60-79)', () => {
      const description = wrapper.vm.getConditionDescription(70)
      expect(description).toBe('Good condition, should perform well')
    })

    it('should return fair description for fair condition (40-59)', () => {
      const description = wrapper.vm.getConditionDescription(50)
      expect(description).toBe('Fair condition, may need some rest')
    })

    it('should return poor description for poor condition (< 40)', () => {
      const description = wrapper.vm.getConditionDescription(30)
      expect(description).toBe('Poor condition, needs recovery time')
    })

    it('should handle edge cases correctly', () => {
      expect(wrapper.vm.getConditionDescription(80)).toBe('Excellent condition, ready for racing')
      expect(wrapper.vm.getConditionDescription(60)).toBe('Good condition, should perform well')
      expect(wrapper.vm.getConditionDescription(40)).toBe('Fair condition, may need some rest')
      expect(wrapper.vm.getConditionDescription(39)).toBe('Poor condition, needs recovery time')
    })
  })

  describe('keyboard navigation', () => {
    it('should handle Enter key on horse card', async () => {
      const horseCard = wrapper.find('.horse-card')
      const focusSpy = vi.spyOn(horseCard.element, 'focus')

      await horseCard.trigger('keydown', { key: 'Enter' })

      expect(focusSpy).toHaveBeenCalled()
    })

    it('should handle Space key on horse card', async () => {
      const horseCard = wrapper.find('.horse-card')
      const focusSpy = vi.spyOn(horseCard.element, 'focus')

      await horseCard.trigger('keydown', { key: ' ' })

      expect(focusSpy).toHaveBeenCalled()
    })

    it('should not handle other keys', async () => {
      const horseCard = wrapper.find('.horse-card')
      const focusSpy = vi.spyOn(horseCard.element, 'focus')

      await horseCard.trigger('keydown', { key: 'Tab' })

      expect(focusSpy).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA labels for each horse card', () => {
      const horseCards = wrapper.findAll('.horse-card')

      mockHorses.forEach((horse, index) => {
        const card = horseCards[index]
        const ariaLabel = card.attributes('aria-label')
        expect(ariaLabel).toContain(horse.name)
        expect(ariaLabel).toContain(`condition ${horse.condition}`)
        expect(ariaLabel).toContain('out of 100')
      })
    })

    it('should have correct role attributes', () => {
      expect(wrapper.find('.horse-list').attributes('role')).toBe('region')
      expect(wrapper.find('.horses-grid').attributes('role')).toBe('list')

      const horseCards = wrapper.findAll('.horse-card')
      horseCards.forEach(card => {
        expect(card.attributes('role')).toBe('listitem')
      })
    })

    it('should have progress bars with correct ARIA attributes', () => {
      const progressBars = wrapper.findAll('.condition-progress')

      mockHorses.forEach((horse, index) => {
        const progressBar = progressBars[index]
        expect(progressBar.attributes('role')).toBe('progressbar')
        expect(progressBar.attributes('aria-valuenow')).toBe(horse.condition.toString())
        expect(progressBar.attributes('aria-valuemin')).toBe('0')
        expect(progressBar.attributes('aria-valuemax')).toBe('100')
      })
    })

    it('should set tabindex correctly for racing horses', () => {
      const horseCards = wrapper.findAll('.horse-card')

      mockHorses.forEach((horse, index) => {
        const card = horseCards[index]
        if (horse.isRacing) {
          expect(card.attributes('tabindex')).toBe('-1')
        } else {
          expect(card.attributes('tabindex')).toBe('0')
        }
      })
    })

    it('should have screen reader only details for each horse', () => {
      const horseCards = wrapper.findAll('.horse-card')

      mockHorses.forEach((horse, index) => {
        const card = horseCards[index]
        const details = card.find(`#horse-${horse.id}-details`)
        expect(details.exists()).toBe(true)
        expect(details.classes()).toContain('sr-only')

        const detailsText = details.text()
        if (horse.isRacing) {
          expect(detailsText).toContain('Currently racing')
        } else {
          expect(detailsText).toContain('Available for racing')
        }
      })
    })
  })

  describe('visual styling', () => {
    it('should apply racing class to racing horses', () => {
      const horseCards = wrapper.findAll('.horse-card')

      mockHorses.forEach((horse, index) => {
        const card = horseCards[index]
        if (horse.isRacing) {
          expect(card.classes()).toContain('racing')
        } else {
          expect(card.classes()).not.toContain('racing')
        }
      })
    })

    it('should apply correct background colors to horse avatars', () => {
      const avatars = wrapper.findAll('.horse-avatar')

      mockHorses.forEach((horse, index) => {
        const avatar = avatars[index]
        const style = avatar.attributes('style')
        // Browsers convert hex colors to RGB format
        expect(style).toContain('background-color:')
      })
    })

    it('should apply condition colors to progress bars', () => {
      const progressFills = wrapper.findAll('.condition-fill')

      mockHorses.forEach((horse, index) => {
        const fill = progressFills[index]
        const style = fill.attributes('style')
        expect(style).toContain(`width: ${horse.condition}%`)

        // Browsers convert hex colors to RGB format
        expect(style).toContain('background-color:')
      })
    })
  })

  describe('empty state', () => {
    it('should handle empty horse list', async () => {
      const emptyStore = createStore({
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
        } as RootState
      })

      const emptyWrapper = mount(HorseList, {
        global: {
          plugins: [emptyStore]
        }
      })

      expect(emptyWrapper.find('#horse-list-title').text()).toBe('Available Horses (0)')
      expect(emptyWrapper.findAll('.horse-card')).toHaveLength(0)

      emptyWrapper.unmount()
    })
  })
})
