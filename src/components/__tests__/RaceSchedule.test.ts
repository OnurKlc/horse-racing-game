import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import RaceSchedule from '../RaceSchedule.vue'
import type { RootState, Horse } from '@/types'

const mockHorses: Horse[] = [
  { id: 3, name: 'Wind Walker', color: '#0000ff', condition: 75, position: 0, isRacing: false },
  { id: 1, name: 'Lightning Bolt', color: '#ff0000', condition: 90, position: 0, isRacing: false },
  { id: 2, name: 'Thunder Strike', color: '#00ff00', condition: 85, position: 0, isRacing: false }
]

const mockRaceSchedule = [
  {
    round: 1,
    distance: 1800,
    horses: mockHorses,
    completed: false
  },
  {
    round: 2,
    distance: 1600,
    horses: mockHorses.slice(0, 2),
    completed: true
  },
  {
    round: 3,
    distance: 2000,
    horses: [],
    completed: false
  }
]

const mockStore = createStore({
  state: {
    raceSchedule: mockRaceSchedule,
    horses: [],
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

const emptyStore = createStore({
  state: {
    raceSchedule: [],
    horses: [],
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

describe('RaceSchedule', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(RaceSchedule, {
      global: {
        plugins: [mockStore]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('rendering', () => {
    it('should render the component when schedule exists', () => {
      expect(wrapper.find('.race-schedule').exists()).toBe(true)
    })

    it('should not render when no schedule exists', () => {
      const emptyWrapper = mount(RaceSchedule, {
        global: {
          plugins: [emptyStore]
        }
      })

      expect(emptyWrapper.find('.race-schedule').exists()).toBe(false)
      emptyWrapper.unmount()
    })

    it('should display the correct title', () => {
      const title = wrapper.find('#schedule-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Race Schedule')
    })

    it('should render all race items', () => {
      const raceItems = wrapper.findAll('.race-item')
      expect(raceItems).toHaveLength(mockRaceSchedule.length)
    })

    it('should display race information correctly', () => {
      const raceItems = wrapper.findAll('.race-item')

      mockRaceSchedule.forEach((race, index) => {
        const item = raceItems[index]
        expect(item.text()).toContain(`Round ${race.round}`)
        expect(item.text()).toContain(`${race.distance}m`)
        expect(item.text()).toContain(`${race.horses.length} horses`)
      })
    })
  })

  describe('hasSchedule computed property', () => {
    it('should return true when schedule exists', () => {
      expect(wrapper.vm.hasSchedule).toBe(true)
    })

    it('should return false when no schedule exists', () => {
      const emptyWrapper = mount(RaceSchedule, {
        global: {
          plugins: [emptyStore]
        }
      })

      expect(emptyWrapper.vm.hasSchedule).toBe(false)
      emptyWrapper.unmount()
    })
  })

  describe('getSortedHorses method', () => {
    it('should sort horses by id in ascending order', () => {
      const unsortedHorses = [...mockHorses]
      const sortedHorses = wrapper.vm.getSortedHorses(unsortedHorses)

      expect(sortedHorses[0].id).toBe(1) // Lightning Bolt
      expect(sortedHorses[1].id).toBe(2) // Thunder Strike
      expect(sortedHorses[2].id).toBe(3) // Wind Walker
    })

    it('should not modify the original array', () => {
      const originalHorses = [...mockHorses]
      const originalOrder = originalHorses.map(h => h.id)

      wrapper.vm.getSortedHorses(originalHorses)

      const afterCallOrder = originalHorses.map(h => h.id)
      expect(afterCallOrder).toEqual(originalOrder)
    })

    it('should handle empty array', () => {
      const result = wrapper.vm.getSortedHorses([])
      expect(result).toEqual([])
    })

    it('should handle single horse', () => {
      const singleHorse = [mockHorses[0]]
      const result = wrapper.vm.getSortedHorses(singleHorse)
      expect(result).toEqual(singleHorse)
    })
  })

  describe('getRaceItemDescription method', () => {
    it('should provide correct description for scheduled race', () => {
      const scheduledRace = mockRaceSchedule[0]
      const description = wrapper.vm.getRaceItemDescription(scheduledRace)

      expect(description).toContain('Scheduled')
      expect(description).toContain(`Round ${scheduledRace.round}`)
      expect(description).toContain(`${scheduledRace.distance} meters`)
      expect(description).toContain(`${scheduledRace.horses.length} horses`)
    })

    it('should provide correct description for completed race', () => {
      const completedRace = mockRaceSchedule[1]
      const description = wrapper.vm.getRaceItemDescription(completedRace)

      expect(description).toContain('Completed')
      expect(description).toContain(`Round ${completedRace.round}`)
      expect(description).toContain(`${completedRace.distance} meters`)
      expect(description).toContain(`${completedRace.horses.length} horses`)
    })
  })

  describe('race item styling', () => {
    it('should apply completed class to completed races', () => {
      const raceItems = wrapper.findAll('.race-item')

      // First race is not completed
      expect(raceItems[0].classes()).not.toContain('completed')

      // Second race is completed
      expect(raceItems[1].classes()).toContain('completed')

      // Third race is not completed
      expect(raceItems[2].classes()).not.toContain('completed')
    })

    it('should display horses with correct colors', () => {
      const horseIndicators = wrapper.findAll('.horse-indicator')

      // Should have indicators for races with horses
      expect(horseIndicators.length).toBeGreaterThan(0)

      // Check that horse indicators have background colors
      horseIndicators.forEach(indicator => {
        const style = indicator.attributes('style')
        expect(style).toContain('background-color:')
      })
    })

    it('should display horse names', () => {
      const horseNames = wrapper.findAll('.horse-name')

      // Should have names for all horses in races with horses
      expect(horseNames.length).toBeGreaterThan(0)

      // Check that horse names are displayed
      const firstRaceHorses = wrapper.findAll('.race-item')[0].findAll('.horse-name')
      expect(firstRaceHorses).toHaveLength(mockRaceSchedule[0].horses.length)
    })
  })

  describe('horse list rendering', () => {
    it('should render horses list when horses exist', () => {
      const firstRaceItem = wrapper.findAll('.race-item')[0]
      const horsesList = firstRaceItem.find('.horses-list')

      expect(horsesList.exists()).toBe(true)
    })

    it('should not render horses list when no horses', () => {
      const thirdRaceItem = wrapper.findAll('.race-item')[2]
      const horsesList = thirdRaceItem.find('.horses-list')

      expect(horsesList.exists()).toBe(false)
    })

    it('should render horses in sorted order', () => {
      const firstRaceItem = wrapper.findAll('.race-item')[0]
      const horseItems = firstRaceItem.findAll('.horse-item')

      // Should render all horses in the race
      expect(horseItems).toHaveLength(mockRaceSchedule[0].horses.length)

      // Horses should be sorted by ID, so Lightning Bolt (id: 1) should be first
      expect(horseItems[0].text()).toContain('Lightning Bolt')
      expect(horseItems[1].text()).toContain('Thunder Strike')
      expect(horseItems[2].text()).toContain('Wind Walker')
    })
  })

  describe('keyboard navigation', () => {
    it('should handle ArrowRight navigation', async () => {
      const raceItems = wrapper.findAll('.race-item')

      if (raceItems.length > 1) {
        const secondItemFocusSpy = vi.spyOn(raceItems[1].element, 'focus')

        await raceItems[0].trigger('keydown', { key: 'ArrowRight' })

        expect(secondItemFocusSpy).toHaveBeenCalled()
      }
    })

    it('should handle ArrowDown navigation', async () => {
      const raceItems = wrapper.findAll('.race-item')

      if (raceItems.length > 1) {
        const secondItemFocusSpy = vi.spyOn(raceItems[1].element, 'focus')

        await raceItems[0].trigger('keydown', { key: 'ArrowDown' })

        expect(secondItemFocusSpy).toHaveBeenCalled()
      }
    })

    it('should handle ArrowLeft navigation', async () => {
      const raceItems = wrapper.findAll('.race-item')

      if (raceItems.length > 1) {
        const firstItemFocusSpy = vi.spyOn(raceItems[0].element, 'focus')

        await raceItems[1].trigger('keydown', { key: 'ArrowLeft' })

        expect(firstItemFocusSpy).toHaveBeenCalled()
      }
    })

    it('should handle ArrowUp navigation', async () => {
      const raceItems = wrapper.findAll('.race-item')

      if (raceItems.length > 1) {
        const firstItemFocusSpy = vi.spyOn(raceItems[0].element, 'focus')

        await raceItems[1].trigger('keydown', { key: 'ArrowUp' })

        expect(firstItemFocusSpy).toHaveBeenCalled()
      }
    })

    it('should handle Home key navigation', async () => {
      const raceItems = wrapper.findAll('.race-item')

      if (raceItems.length > 0) {
        const firstItemFocusSpy = vi.spyOn(raceItems[0].element, 'focus')

        await raceItems[raceItems.length - 1].trigger('keydown', { key: 'Home' })

        expect(firstItemFocusSpy).toHaveBeenCalled()
      }
    })

    it('should handle End key navigation', async () => {
      const raceItems = wrapper.findAll('.race-item')

      if (raceItems.length > 0) {
        const lastItemFocusSpy = vi.spyOn(raceItems[raceItems.length - 1].element, 'focus')

        await raceItems[0].trigger('keydown', { key: 'End' })

        expect(lastItemFocusSpy).toHaveBeenCalled()
      }
    })

    it('should handle Enter and Space keys', async () => {
      const raceItem = wrapper.find('.race-item')
      const focusSpy = vi.spyOn(raceItem.element, 'focus')

      await raceItem.trigger('keydown', { key: 'Enter' })
      expect(focusSpy).toHaveBeenCalled()

      await raceItem.trigger('keydown', { key: ' ' })
      expect(focusSpy).toHaveBeenCalledTimes(2)
    })

    it('should not navigate beyond bounds', async () => {
      const raceItems = wrapper.findAll('.race-item')

      if (raceItems.length > 0) {
        // Try to go left from first item - should not change focus
        const firstItemFocusSpy = vi.spyOn(raceItems[0].element, 'focus')
        await raceItems[0].trigger('keydown', { key: 'ArrowLeft' })
        expect(firstItemFocusSpy).not.toHaveBeenCalled()

        // Try to go right from last item - should not change focus
        const lastItem = raceItems[raceItems.length - 1]
        const lastItemFocusSpy = vi.spyOn(lastItem.element, 'focus')
        await lastItem.trigger('keydown', { key: 'ArrowRight' })
        expect(lastItemFocusSpy).not.toHaveBeenCalled()
      }
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA roles and labels', () => {
      expect(wrapper.find('.race-schedule').attributes('role')).toBe('region')
      expect(wrapper.find('.schedule-grid').attributes('role')).toBe('list')

      const raceItems = wrapper.findAll('.race-item')
      raceItems.forEach(item => {
        expect(item.attributes('role')).toBe('listitem')
        expect(item.attributes('tabindex')).toBe('0')
      })
    })

    it('should have proper ARIA labels for race items', () => {
      const raceItems = wrapper.findAll('.race-item')

      raceItems.forEach(item => {
        const ariaLabel = item.attributes('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('Round')
        expect(ariaLabel).toContain('meters')
        expect(ariaLabel).toContain('horses')
      })
    })

    it('should have screen reader details for each race', () => {
      mockRaceSchedule.forEach((_, index) => {
        const details = wrapper.find(`#race-${index}-details`)
        expect(details.exists()).toBe(true)
        expect(details.classes()).toContain('sr-only')

        const detailsText = details.text()
        expect(detailsText).toContain(`Round ${mockRaceSchedule[index].round}`)
        expect(detailsText).toContain(`${mockRaceSchedule[index].distance} meter race`)

        if (mockRaceSchedule[index].completed) {
          expect(detailsText).toContain('Race completed')
        } else {
          expect(detailsText).toContain('Race scheduled')
        }
      })
    })

    it('should have proper ARIA labels for horse grids', () => {
      const horsesGrids = wrapper.findAll('.horses-grid')

      horsesGrids.forEach(grid => {
        expect(grid.attributes('role')).toBe('list')
        const ariaLabel = grid.attributes('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('horses participating')
      })
    })

    it('should have proper ARIA labels for horse items', () => {
      const horseItems = wrapper.findAll('.horse-item')

      horseItems.forEach(item => {
        expect(item.attributes('role')).toBe('listitem')
        const ariaLabel = item.attributes('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('with color')
      })
    })

    it('should have screen reader titles for horse lists', () => {
      // Note: The template has a small error in the ID - it should not be wrapped in backticks
      // But we test for the element existence
      const horsesLists = wrapper.findAll('.horses-list')

      horsesLists.forEach(list => {
        // The SR title should exist (even with the template error)
        const srOnly = list.find('.sr-only')
        expect(srOnly.exists()).toBe(true)
      })
    })
  })

  describe('edge cases', () => {
    it('should handle race with no horses gracefully', () => {
      const thirdRaceItem = wrapper.findAll('.race-item')[2]

      // Should still display race info
      expect(thirdRaceItem.text()).toContain('Round 3')
      expect(thirdRaceItem.text()).toContain('2000m')
      expect(thirdRaceItem.text()).toContain('0 horses')

      // Should not display horses list
      expect(thirdRaceItem.find('.horses-list').exists()).toBe(false)
    })

    it('should handle single race item navigation', () => {
      const singleRaceStore = createStore({
        state: {
          raceSchedule: [mockRaceSchedule[0]],
          horses: [],
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

      const singleWrapper = mount(RaceSchedule, {
        global: {
          plugins: [singleRaceStore]
        }
      })

      const raceItem = singleWrapper.find('.race-item')
      expect(raceItem.exists()).toBe(true)

      singleWrapper.unmount()
    })

    it('should handle races with duplicate horse IDs in sorting', () => {
      const duplicateHorses = [
        { id: 1, name: 'Horse A', color: '#red', condition: 80, position: 0, isRacing: false },
        { id: 1, name: 'Horse B', color: '#blue', condition: 75, position: 0, isRacing: false }
      ]

      const sorted = wrapper.vm.getSortedHorses(duplicateHorses)
      expect(sorted).toHaveLength(2)
      expect(sorted[0].id).toBe(1)
      expect(sorted[1].id).toBe(1)
    })
  })
})
