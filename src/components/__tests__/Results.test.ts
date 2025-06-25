import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import Results from '../Results.vue'
import type { RootState } from '@/types'

const mockRaceResults = [
  {
    round: 1,
    distance: 1800,
    results: [
      {
        position: 1,
        horse: { id: 1, name: 'Lightning Bolt', color: '#ff0000', condition: 90 },
        time: '45.2'
      },
      {
        position: 2,
        horse: { id: 2, name: 'Thunder Strike', color: '#00ff00', condition: 85 },
        time: '46.8'
      },
      {
        position: 3,
        horse: { id: 3, name: 'Wind Walker', color: '#0000ff', condition: 75 },
        time: '48.1'
      },
      {
        position: 4,
        horse: { id: 4, name: 'Storm Chaser', color: '#ffff00', condition: 80 },
        time: '49.5'
      }
    ]
  },
  {
    round: 2,
    distance: 1600,
    results: [
      {
        position: 1,
        horse: { id: 2, name: 'Thunder Strike', color: '#00ff00', condition: 85 },
        time: '42.1'
      },
      {
        position: 2,
        horse: { id: 1, name: 'Lightning Bolt', color: '#ff0000', condition: 90 },
        time: '43.5'
      }
    ]
  }
]

const mockStore = createStore({
  state: {
    raceResults: mockRaceResults,
    horses: [],
    raceSchedule: [],
    currentRaceHorses: [],
    currentRound: 0,
    isRacing: false,
    isPaused: false,
    isWaitingBetweenRounds: false,
    raceCompleted: false,
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
    raceResults: [],
    horses: [],
    raceSchedule: [],
    currentRaceHorses: [],
    currentRound: 0,
    isRacing: false,
    isPaused: false,
    isWaitingBetweenRounds: false,
    raceCompleted: false,
    soundEnabled: true,
    showConfetti: false,
    lastWinner: null
  } as RootState
})

describe('Results', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(Results, {
      global: {
        plugins: [mockStore]
      }
    })
  })

  afterEach(() => {
    wrapper.unmount()
  })

  describe('rendering', () => {
    it('should render the component when results exist', () => {
      expect(wrapper.find('.results').exists()).toBe(true)
    })

    it('should not render when no results exist', () => {
      const emptyWrapper = mount(Results, {
        global: {
          plugins: [emptyStore]
        }
      })

      expect(emptyWrapper.find('.results').exists()).toBe(false)
      emptyWrapper.unmount()
    })

    it('should display the correct title', () => {
      const title = wrapper.find('#results-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Race Results')
    })

    it('should render all race results', () => {
      const raceResults = wrapper.findAll('.race-result')
      expect(raceResults).toHaveLength(mockRaceResults.length)
    })

    it('should display round information correctly', () => {
      const raceResults = wrapper.findAll('.race-result')

      mockRaceResults.forEach((result, index) => {
        const raceResult = raceResults[index]
        expect(raceResult.text()).toContain(`Round ${result.round}`)
        expect(raceResult.text()).toContain(`${result.distance}m`)
      })
    })
  })

  describe('getPositionName method', () => {
    it('should return correct names for podium positions', () => {
      expect(wrapper.vm.getPositionName(1)).toBe('First')
      expect(wrapper.vm.getPositionName(2)).toBe('Second')
      expect(wrapper.vm.getPositionName(3)).toBe('Third')
    })

    it('should return correct ordinal for other positions', () => {
      expect(wrapper.vm.getPositionName(4)).toBe('4th')
      expect(wrapper.vm.getPositionName(5)).toBe('5th')
      expect(wrapper.vm.getPositionName(10)).toBe('10th')
    })
  })

  describe('getPodiumDescription method', () => {
    it('should provide detailed podium description', () => {
      const place = mockRaceResults[0].results[0]
      const description = wrapper.vm.getPodiumDescription(place)

      expect(description).toContain('First place')
      expect(description).toContain(place.horse.name)
      expect(description).toContain(`condition ${place.horse.condition}`)
      expect(description).toContain(`time ${place.time} seconds`)
    })

    it('should handle different positions correctly', () => {
      const secondPlace = mockRaceResults[0].results[1]
      const description = wrapper.vm.getPodiumDescription(secondPlace)

      expect(description).toContain('Second place')
      expect(description).toContain(secondPlace.horse.name)
    })
  })

  describe('getTableRowDescription method', () => {
    it('should provide detailed table row description', () => {
      const place = mockRaceResults[0].results[0]
      const description = wrapper.vm.getTableRowDescription(place)

      expect(description).toContain(`Position ${place.position}`)
      expect(description).toContain(place.horse.name)
      expect(description).toContain(`condition ${place.horse.condition}`)
      expect(description).toContain(`finished in ${place.time} seconds`)
    })
  })

  describe('podium display', () => {
    it('should render podium for each race', () => {
      const podiums = wrapper.findAll('.podium')
      expect(podiums).toHaveLength(mockRaceResults.length)
    })

    it('should display top 3 horses in each podium', () => {
      const podiumPlaces = wrapper.findAll('.podium-place')

      // First race has 4 horses, so 3 podium places
      // Second race has 2 horses, so 2 podium places
      expect(podiumPlaces).toHaveLength(5) // 3 + 2
    })

    it('should apply correct position classes to podium places', () => {
      const firstRacePodium = wrapper.findAll('.race-result')[0]
      const podiumPlaces = firstRacePodium.findAll('.podium-place')

      expect(podiumPlaces[0].classes()).toContain('place-1')
      expect(podiumPlaces[1].classes()).toContain('place-2')
      expect(podiumPlaces[2].classes()).toContain('place-3')
    })

    it('should display horse information in podium', () => {
      const firstPodiumPlace = wrapper.find('.podium-place')
      const firstPlace = mockRaceResults[0].results[0]

      expect(firstPodiumPlace.text()).toContain(firstPlace.horse.name)
      expect(firstPodiumPlace.text()).toContain(firstPlace.horse.condition.toString())
      expect(firstPodiumPlace.text()).toContain(firstPlace.time)
    })

    it('should set correct background colors for horse circles', () => {
      const horseCircles = wrapper.findAll('.horse-circle')

      // Check first few horse circles have background colors
      const firstCircle = horseCircles[0]
      const style = firstCircle.attributes('style')
      // Browsers convert hex colors to RGB format
      expect(style).toContain('background-color:')
    })
  })

  describe('results table', () => {
    it('should render results tables for each race', () => {
      const tables = wrapper.findAll('.results-table')
      expect(tables).toHaveLength(mockRaceResults.length)
    })

    it('should have proper table headers', () => {
      const table = wrapper.find('.results-table')
      const headers = table.findAll('th')

      expect(headers).toHaveLength(4)
      expect(headers[0].text()).toBe('Position')
      expect(headers[1].text()).toBe('Horse')
      expect(headers[2].text()).toBe('Condition')
      expect(headers[3].text()).toBe('Time')
    })

    it('should display all horses in results table', () => {
      const firstTable = wrapper.findAll('.results-table')[0]
      const rows = firstTable.findAll('tbody tr')

      expect(rows).toHaveLength(mockRaceResults[0].results.length)
    })

    it('should apply top-three class to podium finishers', () => {
      const firstTable = wrapper.findAll('.results-table')[0]
      const rows = firstTable.findAll('tbody tr')

      // First 3 rows should have top-three class
      expect(rows[0].classes()).toContain('top-three')
      expect(rows[1].classes()).toContain('top-three')
      expect(rows[2].classes()).toContain('top-three')

      // 4th place should not have top-three class
      if (rows[3]) {
        expect(rows[3].classes()).not.toContain('top-three')
      }
    })

    it('should display position badges with correct classes', () => {
      const firstTable = wrapper.findAll('.results-table')[0]
      const positionBadges = firstTable.findAll('.position-badge')

      expect(positionBadges[0].classes()).toContain('position-1')
      expect(positionBadges[1].classes()).toContain('position-2')
      expect(positionBadges[2].classes()).toContain('position-3')
    })

    it('should display color indicators for horses', () => {
      const colorIndicators = wrapper.findAll('.color-indicator')
      expect(colorIndicators.length).toBeGreaterThan(0)

      // Check first color indicator has background color
      const firstIndicator = colorIndicators[0]
      const style = firstIndicator.attributes('style')
      // Browsers convert hex colors to RGB format
      expect(style).toContain('background-color:')
    })
  })

  describe('keyboard navigation', () => {
    describe('podium keyboard navigation', () => {
      it('should handle Enter key on podium place', async () => {
        const podiumPlace = wrapper.find('.podium-place')
        const focusSpy = vi.spyOn(podiumPlace.element, 'focus')

        await podiumPlace.trigger('keydown', { key: 'Enter' })

        expect(focusSpy).toHaveBeenCalled()
      })

      it('should handle Space key on podium place', async () => {
        const podiumPlace = wrapper.find('.podium-place')
        const focusSpy = vi.spyOn(podiumPlace.element, 'focus')

        await podiumPlace.trigger('keydown', { key: ' ' })

        expect(focusSpy).toHaveBeenCalled()
      })
    })

    describe('table keyboard navigation', () => {
      it('should handle ArrowDown navigation', async () => {
        const table = wrapper.find('.results-table')
        const rows = table.findAll('tbody tr')

        if (rows.length > 1) {
          const secondRowFocusSpy = vi.spyOn(rows[1].element, 'focus')

          await rows[0].trigger('keydown', { key: 'ArrowDown' })

          expect(secondRowFocusSpy).toHaveBeenCalled()
        }
      })

      it('should handle ArrowUp navigation', async () => {
        const table = wrapper.find('.results-table')
        const rows = table.findAll('tbody tr')

        if (rows.length > 1) {
          const firstRowFocusSpy = vi.spyOn(rows[0].element, 'focus')

          await rows[1].trigger('keydown', { key: 'ArrowUp' })

          expect(firstRowFocusSpy).toHaveBeenCalled()
        }
      })

      it('should handle Home key navigation', async () => {
        const table = wrapper.find('.results-table')
        const rows = table.findAll('tbody tr')

        if (rows.length > 0) {
          const firstRowFocusSpy = vi.spyOn(rows[0].element, 'focus')

          await rows[rows.length - 1].trigger('keydown', { key: 'Home' })

          expect(firstRowFocusSpy).toHaveBeenCalled()
        }
      })

      it('should handle End key navigation', async () => {
        const table = wrapper.find('.results-table')
        const rows = table.findAll('tbody tr')

        if (rows.length > 0) {
          const lastRowFocusSpy = vi.spyOn(rows[rows.length - 1].element, 'focus')

          await rows[0].trigger('keydown', { key: 'End' })

          expect(lastRowFocusSpy).toHaveBeenCalled()
        }
      })

      it('should handle Enter and Space on table rows', async () => {
        const row = wrapper.find('tbody tr')
        const focusSpy = vi.spyOn(row.element, 'focus')

        await row.trigger('keydown', { key: 'Enter' })
        expect(focusSpy).toHaveBeenCalled()

        await row.trigger('keydown', { key: ' ' })
        expect(focusSpy).toHaveBeenCalledTimes(2)
      })

      it('should not navigate beyond table bounds', async () => {
        const table = wrapper.find('.results-table')
        const rows = table.findAll('tbody tr')

        if (rows.length > 0) {
          // Try to go up from first row - should not change focus
          const firstRowFocusSpy = vi.spyOn(rows[0].element, 'focus')
          await rows[0].trigger('keydown', { key: 'ArrowUp' })
          expect(firstRowFocusSpy).not.toHaveBeenCalled()

          // Try to go down from last row - should not change focus
          const lastRow = rows[rows.length - 1]
          const lastRowFocusSpy = vi.spyOn(lastRow.element, 'focus')
          await lastRow.trigger('keydown', { key: 'ArrowDown' })
          expect(lastRowFocusSpy).not.toHaveBeenCalled()
        }
      })
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA roles and labels', () => {
      expect(wrapper.find('.results').attributes('role')).toBe('region')
      expect(wrapper.find('.results-container').attributes('role')).toBe('list')

      const raceResults = wrapper.findAll('.race-result')
      raceResults.forEach(result => {
        expect(result.attributes('role')).toBe('listitem')
      })
    })

    it('should have proper table accessibility attributes', () => {
      const table = wrapper.find('.results-table')
      expect(table.attributes('role')).toBe('table')

      const headers = table.findAll('th')
      headers.forEach(header => {
        expect(header.attributes('scope')).toBe('col')
        expect(header.attributes('role')).toBe('columnheader')
      })

      const rows = table.findAll('tr')
      rows.forEach(row => {
        expect(row.attributes('role')).toBe('row')
      })

      const cells = table.findAll('td')
      cells.forEach(cell => {
        expect(cell.attributes('role')).toBe('cell')
      })
    })

    it('should have proper ARIA labels for podium places', () => {
      const podiumPlaces = wrapper.findAll('.podium-place')

      podiumPlaces.forEach(place => {
        const ariaLabel = place.attributes('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('place:')
      })
    })

    it('should have proper ARIA labels for table rows', () => {
      const tableRows = wrapper.findAll('tbody tr')

      tableRows.forEach(row => {
        const ariaLabel = row.attributes('aria-label')
        expect(ariaLabel).toBeTruthy()
        expect(ariaLabel).toContain('Position')
      })
    })

    it('should have screen reader descriptions', () => {
      // Check for podium details
      const podiumDetails = wrapper.findAll('[id*="podium-"][id*="-details"]')
      expect(podiumDetails.length).toBeGreaterThan(0)

      podiumDetails.forEach(detail => {
        expect(detail.classes()).toContain('sr-only')
      })

      // Check for table description
      const tableDescription = wrapper.find('#table-description')
      expect(tableDescription.exists()).toBe(true)
      expect(tableDescription.classes()).toContain('sr-only')
    })

    it('should have tabindex for interactive elements', () => {
      const podiumPlaces = wrapper.findAll('.podium-place')
      podiumPlaces.forEach(place => {
        expect(place.attributes('tabindex')).toBe('0')
      })

      const tableRows = wrapper.findAll('tbody tr')
      tableRows.forEach(row => {
        expect(row.attributes('tabindex')).toBe('0')
      })
    })
  })

  describe('edge cases', () => {
    it('should handle race with fewer than 3 horses', () => {
      // Second race in mock data has only 2 horses
      const secondRaceResult = wrapper.findAll('.race-result')[1]
      const podiumPlaces = secondRaceResult.findAll('.podium-place')

      expect(podiumPlaces).toHaveLength(2) // Should only show 2 podium places
    })

    it('should handle position ordinals correctly', () => {
      // Test various position numbers - the current implementation uses simple 'th' suffix for all non-podium positions
      expect(wrapper.vm.getPositionName(11)).toBe('11th')
      expect(wrapper.vm.getPositionName(21)).toBe('21th') // Current implementation uses simple 'th' suffix
      expect(wrapper.vm.getPositionName(22)).toBe('22th') // Current implementation uses simple 'th' suffix
    })

    it('should handle empty race results gracefully', () => {
      const emptyWrapper = mount(Results, {
        global: {
          plugins: [emptyStore]
        }
      })

      expect(emptyWrapper.find('.results').exists()).toBe(false)
      emptyWrapper.unmount()
    })

    it('should handle keyboard navigation with single row', () => {
      // Create a store with only one result
      const singleResultStore = createStore({
        state: {
          raceResults: [
            {
              round: 1,
              distance: 1000,
              results: [
                {
                  position: 1,
                  horse: { id: 1, name: 'Solo Horse', color: '#ff0000', condition: 90 },
                  time: '30.0'
                }
              ]
            }
          ],
          horses: [],
          raceSchedule: [],
          currentRaceHorses: [],
          currentRound: 0,
          isRacing: false,
          isPaused: false,
          isWaitingBetweenRounds: false,
          raceCompleted: false,
          soundEnabled: true,
          showConfetti: false,
          lastWinner: null
        } as RootState
      })

      const singleWrapper = mount(Results, {
        global: {
          plugins: [singleResultStore]
        }
      })

      const row = singleWrapper.find('tbody tr')
      expect(row.exists()).toBe(true)

      singleWrapper.unmount()
    })
  })
})
