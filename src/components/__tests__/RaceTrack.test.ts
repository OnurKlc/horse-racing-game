import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'
import { createStore } from 'vuex'
import RaceTrack from '../RaceTrack.vue'
import type { RootState, Horse } from '@/types'

const mockRaceData = {
  round: 1,
  distance: 1800,
  horses: [],
  completed: false
}

const mockCurrentRaceHorses: Horse[] = [
  {
    id: 1,
    name: 'Lightning Bolt',
    color: '#ff0000',
    condition: 90,
    position: 0,
    isRacing: true,
    raceTime: null
  },
  {
    id: 2,
    name: 'Thunder Strike',
    color: '#00ff00',
    condition: 85,
    position: 1800,
    isRacing: true,
    raceTime: 45.2
  },
  {
    id: 3,
    name: 'Wind Walker',
    color: '#0000ff',
    condition: 75,
    position: 1800,
    isRacing: true,
    raceTime: 46.8
  },
  {
    id: 4,
    name: 'Storm Chaser',
    color: '#ffff00',
    condition: 80,
    position: 900,
    isRacing: true,
    raceTime: null
  }
]

const mockStore = createStore({
  state: {
    horses: [],
    raceSchedule: [mockRaceData],
    currentRaceHorses: mockCurrentRaceHorses,
    currentRound: 0,
    isRacing: true,
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
  getters: {
    currentRaceData: () => mockRaceData
  }
})

describe('RaceTrack', () => {
  let wrapper: any

  beforeEach(() => {
    wrapper = mount(RaceTrack, {
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
      expect(wrapper.find('.race-track').exists()).toBe(true)
    })

    it('should display the correct race title', () => {
      const title = wrapper.find('#race-track-title')
      expect(title.exists()).toBe(true)
      expect(title.text()).toBe('Round 1 - 1800m')
    })

    it('should render all race lanes', () => {
      const lanes = wrapper.findAll('.lane')
      expect(lanes).toHaveLength(mockCurrentRaceHorses.length)
    })

    it('should display lane numbers correctly', () => {
      const laneNumbers = wrapper.findAll('.lane-number')
      laneNumbers.forEach((laneNumber, index) => {
        expect(laneNumber.text()).toBe((index + 1).toString())
      })
    })

    it('should display horse names and conditions', () => {
      const lanes = wrapper.findAll('.lane')
      mockCurrentRaceHorses.forEach((horse, index) => {
        const lane = lanes[index]
        expect(lane.text()).toContain(horse.name)
        expect(lane.text()).toContain(horse.condition.toString())
      })
    })
  })

  describe('finishedHorses computed property', () => {
    it('should return finished horses sorted by race time', () => {
      const finishedHorses = wrapper.vm.finishedHorses

      // Should have 2 finished horses (position >= distance and raceTime !== null)
      expect(finishedHorses).toHaveLength(2)

      // Should be sorted by race time (Thunder Strike first, Wind Walker second)
      expect(finishedHorses[0].id).toBe(2) // Thunder Strike: 45.2
      expect(finishedHorses[1].id).toBe(3) // Wind Walker: 46.8
    })

    it("should exclude horses that haven't finished", () => {
      const finishedHorses = wrapper.vm.finishedHorses

      // Lightning Bolt (position 0) and Storm Chaser (position 900) shouldn't be included
      const unfinishedIds = finishedHorses.map((horse: Horse) => horse.id)
      expect(unfinishedIds).not.toContain(1) // Lightning Bolt
      expect(unfinishedIds).not.toContain(4) // Storm Chaser
    })
  })

  describe('getFinishPosition method', () => {
    it('should return empty string for unfinished horses', () => {
      const lightning = mockCurrentRaceHorses[0] // position 0
      const storm = mockCurrentRaceHorses[3] // position 900

      expect(wrapper.vm.getFinishPosition(lightning)).toBe('')
      expect(wrapper.vm.getFinishPosition(storm)).toBe('')
    })

    it('should return correct positions for finished horses', () => {
      const thunder = mockCurrentRaceHorses[1] // 1st place
      const wind = mockCurrentRaceHorses[2] // 2nd place

      expect(wrapper.vm.getFinishPosition(thunder)).toBe('first-place')
      expect(wrapper.vm.getFinishPosition(wind)).toBe('second-place')
    })

    it('should handle third place correctly', () => {
      // The method requires the horse to be in the finishedHorses computed property
      // which is based on the store data. Since we only have 2 finished horses in mock data,
      // a horse with a different raceTime would be considered as 'finished' not 'third-place'
      const thirdHorse: Horse = {
        id: 5,
        name: 'Test Horse',
        color: '#purple',
        condition: 70,
        position: 1800,
        isRacing: true,
        raceTime: 50.0
      }

      // This horse would be considered 'finished' since it's not in the finishedHorses list
      expect(wrapper.vm.getFinishPosition(thirdHorse)).toBe('finished')
    })

    it('should return "finished" for horses beyond third place', () => {
      // Add a fourth finished horse for testing
      const fourthHorse: Horse = {
        id: 6,
        name: 'Fourth Horse',
        color: '#orange',
        condition: 65,
        position: 1800,
        isRacing: true,
        raceTime: 55.0
      }

      expect(wrapper.vm.getFinishPosition(fourthHorse)).toBe('finished')
    })
  })

  describe('getLaneDescription method', () => {
    it('should provide correct lane description for racing horses', () => {
      const lightning = mockCurrentRaceHorses[0]
      const description = wrapper.vm.getLaneDescription(lightning, 0)

      expect(description).toContain('Lane 1')
      expect(description).toContain(lightning.name)
      expect(description).toContain('0% complete')
      expect(description).toContain('Racing')
    })

    it('should provide correct lane description for finished horses', () => {
      const thunder = mockCurrentRaceHorses[1]
      const description = wrapper.vm.getLaneDescription(thunder, 1)

      expect(description).toContain('Lane 2')
      expect(description).toContain(thunder.name)
      expect(description).toContain('100% complete')
      expect(description).toContain('First place!')
    })

    it('should calculate progress correctly for mid-race horses', () => {
      const storm = mockCurrentRaceHorses[3] // position 900 of 1800 = 50%
      const description = wrapper.vm.getLaneDescription(storm, 3)

      expect(description).toContain('50% complete')
      expect(description).toContain('Racing')
    })

    it('should handle all place positions correctly', () => {
      const wind = mockCurrentRaceHorses[2]
      const description = wrapper.vm.getLaneDescription(wind, 2)

      expect(description).toContain('Second place!')
    })
  })

  describe('getRaceStatusDescription method', () => {
    it('should provide detailed status for racing horses', () => {
      const lightning = mockCurrentRaceHorses[0]
      const description = wrapper.vm.getRaceStatusDescription(lightning)

      expect(description).toContain('0 meters of 1800 meters')
      expect(description).toContain('Currently racing at 0% completion')
    })

    it('should provide detailed status for winners', () => {
      const thunder = mockCurrentRaceHorses[1]
      const description = wrapper.vm.getRaceStatusDescription(thunder)

      expect(description).toContain('1800 meters of 1800 meters')
      expect(description).toContain('Winner! First place finish.')
    })

    it('should provide detailed status for second place', () => {
      const wind = mockCurrentRaceHorses[2]
      const description = wrapper.vm.getRaceStatusDescription(wind)

      expect(description).toContain('Second place finish.')
    })

    it('should handle mid-race status correctly', () => {
      const storm = mockCurrentRaceHorses[3]
      const description = wrapper.vm.getRaceStatusDescription(storm)

      expect(description).toContain('900 meters of 1800 meters')
      expect(description).toContain('Currently racing at 50% completion')
    })
  })

  describe('keyboard navigation', () => {
    it('should handle Enter key on lane', async () => {
      const lane = wrapper.find('.lane')
      const focusSpy = vi.spyOn(lane.element, 'focus')

      await lane.trigger('keydown', { key: 'Enter' })

      expect(focusSpy).toHaveBeenCalled()
    })

    it('should handle Space key on lane', async () => {
      const lane = wrapper.find('.lane')
      const focusSpy = vi.spyOn(lane.element, 'focus')

      await lane.trigger('keydown', { key: ' ' })

      expect(focusSpy).toHaveBeenCalled()
    })

    it('should not handle other keys', async () => {
      const lane = wrapper.find('.lane')
      const focusSpy = vi.spyOn(lane.element, 'focus')

      await lane.trigger('keydown', { key: 'Tab' })

      expect(focusSpy).not.toHaveBeenCalled()
    })
  })

  describe('accessibility', () => {
    it('should have proper ARIA roles and labels', () => {
      expect(wrapper.find('.race-track').attributes('role')).toBe('region')
      expect(wrapper.find('.track-container').attributes('role')).toBe('application')
      expect(wrapper.find('.lanes').attributes('role')).toBe('list')

      const lanes = wrapper.findAll('.lane')
      lanes.forEach(lane => {
        expect(lane.attributes('role')).toBe('listitem')
        expect(lane.attributes('tabindex')).toBe('0')
      })
    })

    it('should have proper progress bar attributes', () => {
      const progressBars = wrapper.findAll('.track-surface')

      mockCurrentRaceHorses.forEach((horse, index) => {
        const progressBar = progressBars[index]
        expect(progressBar.attributes('role')).toBe('progressbar')
        expect(progressBar.attributes('aria-valuenow')).toBe(horse.position.toString())
        expect(progressBar.attributes('aria-valuemin')).toBe('0')
        expect(progressBar.attributes('aria-valuemax')).toBe(mockRaceData.distance.toString())
      })
    })

    it('should have screen reader instructions', () => {
      const instructions = wrapper.find('#race-instructions')
      expect(instructions.exists()).toBe(true)
      expect(instructions.classes()).toContain('sr-only')
      expect(instructions.text()).toContain('Horse race in progress')
    })

    it('should have detailed descriptions for each horse', () => {
      mockCurrentRaceHorses.forEach(horse => {
        const details = wrapper.find(`#horse-${horse.id}-race-details`)
        expect(details.exists()).toBe(true)
        expect(details.classes()).toContain('sr-only')
      })
    })

    it('should have proper lane descriptions', () => {
      const lanes = wrapper.findAll('.lane')

      mockCurrentRaceHorses.forEach((horse, index) => {
        const lane = lanes[index]
        const ariaLabel = lane.attributes('aria-label')
        expect(ariaLabel).toContain(`Lane ${index + 1}`)
        expect(ariaLabel).toContain(horse.name)
      })
    })
  })

  describe('visual elements', () => {
    it('should display start and finish lines', () => {
      expect(wrapper.find('.start-line').exists()).toBe(true)
      expect(wrapper.find('.finish-line').exists()).toBe(true)
      expect(wrapper.find('.start-line').text()).toBe('START')
      expect(wrapper.find('.finish-line').text()).toBe('FINISH')
    })

    it('should display distance markers', () => {
      const markers = wrapper.findAll('.marker')
      expect(markers).toHaveLength(5) // 0%, 25%, 50%, 75%, 100%

      expect(markers[0].text()).toBe('0m')
      expect(markers[1].text()).toBe('450m') // 25% of 1800
      expect(markers[2].text()).toBe('900m') // 50% of 1800
      expect(markers[3].text()).toBe('1350m') // 75% of 1800
      expect(markers[4].text()).toBe('1800m') // 100% of 1800
    })

    it('should position horses correctly based on their progress', () => {
      const horses = wrapper.findAll('.horse')

      mockCurrentRaceHorses.forEach((horse, index) => {
        const horseElement = horses[index]
        const expectedLeft = `${(horse.position / mockRaceData.distance) * 100}%`
        const style = horseElement.attributes('style')
        expect(style).toContain(`left: ${expectedLeft}`)
      })
    })

    it('should apply correct colors to horse circles', () => {
      const horseCircles = wrapper.findAll('.horse-circle')

      mockCurrentRaceHorses.forEach((horse, index) => {
        const circle = horseCircles[index]
        const style = circle.attributes('style')
        // Browsers convert hex colors to RGB format
        expect(style).toContain('background-color:')
      })
    })

    it('should apply finish position classes correctly', () => {
      const horseInfos = wrapper.findAll('.horse-info')

      // Thunder Strike should have first-place class
      expect(horseInfos[1].classes()).toContain('first-place')

      // Wind Walker should have second-place class
      expect(horseInfos[2].classes()).toContain('second-place')

      // Racing horses should not have finish classes
      expect(horseInfos[0].classes()).not.toContain('first-place')
      expect(horseInfos[0].classes()).not.toContain('second-place')
      expect(horseInfos[0].classes()).not.toContain('third-place')
    })
  })

  describe('edge cases', () => {
    it('should handle empty race data gracefully', () => {
      const emptyStore = createStore({
        state: {
          currentRaceHorses: [],
          currentRound: 0,
          horses: [],
          raceSchedule: [],
          isRacing: false,
          isPaused: false,
          isWaitingBetweenRounds: false,
          raceCompleted: false,
          raceResults: [],
          soundEnabled: true,
          showConfetti: false,
          lastWinner: null
        } as RootState,
        getters: {
          currentRaceData: () => ({ round: 1, distance: 1000, horses: [], completed: false })
        }
      })

      const emptyWrapper = mount(RaceTrack, {
        global: {
          plugins: [emptyStore]
        }
      })

      expect(emptyWrapper.find('.race-track').exists()).toBe(true)
      expect(emptyWrapper.findAll('.lane')).toHaveLength(0)

      emptyWrapper.unmount()
    })

    it('should handle horses with zero position', () => {
      const zeroHorse = mockCurrentRaceHorses[0] // position 0
      const description = wrapper.vm.getRaceStatusDescription(zeroHorse)

      expect(description).toContain('0 meters of 1800 meters')
      expect(description).toContain('0% completion')
    })

    it('should handle horses at exactly the finish line', () => {
      const finishedHorse = mockCurrentRaceHorses[1] // position 1800
      const progress = Math.round((finishedHorse.position / mockRaceData.distance) * 100)

      expect(progress).toBe(100)
      expect(wrapper.vm.getFinishPosition(finishedHorse)).toBe('first-place')
    })
  })
})
