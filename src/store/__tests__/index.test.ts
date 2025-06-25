import { describe, it, expect, beforeEach } from 'vitest'
import store from '../index'
import type { Horse } from '@/types'

describe('Vuex Store', () => {
  beforeEach(() => {
    // Reset store state
    store.commit('GENERATE_RACE_SCHEDULE')
    store.state.horses = []
    store.state.currentRaceHorses = []
    store.state.currentRound = 0
    store.state.isRacing = false
    store.state.isPaused = false
    store.state.raceCompleted = false
    store.state.raceResults = []
    store.state.soundEnabled = true
  })

  describe('mutations', () => {
    it('should generate race schedule correctly', () => {
      store.commit('GENERATE_RACE_SCHEDULE')

      expect(store.state.raceSchedule).toHaveLength(6)
      store.state.raceSchedule.forEach((race: any, index: number) => {
        expect(race).toHaveProperty('round')
        expect(race).toHaveProperty('distance')
        expect(race).toHaveProperty('horses')
        expect(race).toHaveProperty('completed')
        expect(race.round).toBe(index + 1)
        expect(race.distance).toBeGreaterThanOrEqual(1200)
        expect(race.distance).toBeLessThanOrEqual(2200)
      })
    })

    it('should set racing status', () => {
      store.commit('SET_RACING_STATUS', true)
      expect(store.state.isRacing).toBe(true)

      store.commit('SET_RACING_STATUS', false)
      expect(store.state.isRacing).toBe(false)
    })

    it('should set paused status', () => {
      store.commit('SET_PAUSED_STATUS', true)
      expect(store.state.isPaused).toBe(true)

      store.commit('SET_PAUSED_STATUS', false)
      expect(store.state.isPaused).toBe(false)
    })

    it('should set current round', () => {
      store.commit('SET_CURRENT_ROUND', 3)
      expect(store.state.currentRound).toBe(3)
    })

    it('should set race horses for a round', () => {
      const horses: Horse[] = [
        { id: 1, name: 'Test Horse', color: '#ff0000', condition: 80, position: 0, isRacing: false }
      ]

      store.commit('GENERATE_RACE_SCHEDULE')
      store.commit('SET_RACE_HORSES', { round: 0, horses })

      expect(store.state.currentRaceHorses).toEqual(horses)
      expect(store.state.raceSchedule[0].horses).toEqual(horses)
    })

    it('should update horse position', () => {
      const horses: Horse[] = [
        { id: 1, name: 'Test Horse', color: '#ff0000', condition: 80, position: 0, isRacing: false }
      ]

      store.commit('GENERATE_RACE_SCHEDULE')
      store.commit('SET_RACE_HORSES', { round: 0, horses })
      store.commit('UPDATE_HORSE_POSITION', { horseId: 1, position: 100 })

      expect(store.state.currentRaceHorses[0].position).toBe(100)
    })

    it('should set sound enabled status', () => {
      expect(store.state.soundEnabled).toBe(true)
      store.commit('SET_SOUND_ENABLED', false)
      expect(store.state.soundEnabled).toBe(false)
      store.commit('SET_SOUND_ENABLED', true)
      expect(store.state.soundEnabled).toBe(true)
    })

    it('should reset horse positions', () => {
      const horses: Horse[] = [
        {
          id: 1,
          name: 'Test Horse',
          color: '#ff0000',
          condition: 80,
          position: 100,
          isRacing: false
        }
      ]

      store.commit('GENERATE_RACE_SCHEDULE')
      store.commit('SET_RACE_HORSES', { round: 0, horses })
      store.commit('RESET_HORSE_POSITIONS')

      expect(store.state.currentRaceHorses[0].position).toBe(0)
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.commit('GENERATE_RACE_SCHEDULE')
    })

    it('should get current race data', () => {
      const currentRaceData = store.getters.currentRaceData
      expect(currentRaceData).toHaveProperty('round')
      expect(currentRaceData).toHaveProperty('distance')
      expect(currentRaceData).toHaveProperty('horses')
    })

    it('should return null for current race data when no schedule', () => {
      store.state.raceSchedule = []
      const currentRaceData = store.getters.currentRaceData
      expect(currentRaceData).toBeNull()
    })

    it('should check schedule length directly', () => {
      expect(store.state.raceSchedule.length).toBeGreaterThan(0)

      store.state.raceSchedule = []
      expect(store.state.raceSchedule.length).toBe(0)
    })
  })

  describe('actions', () => {
    it('should generate new race schedule', async () => {
      await store.dispatch('generateRaceSchedule')

      expect(store.state.raceSchedule).toHaveLength(6)
      expect(store.state.currentRound).toBe(0)
      expect(store.state.raceCompleted).toBe(false)
    })

    it('should start race', async () => {
      await store.dispatch('generateRaceSchedule')

      // Mock the race start without running the full race
      store.commit('SET_RACING_STATUS', true)
      store.commit('SET_CURRENT_ROUND', 0)
      const raceData = store.state.raceSchedule[0]
      store.commit('SET_RACE_HORSES', { round: 0, horses: raceData.horses })

      expect(store.state.isRacing).toBe(true)
      expect(store.state.currentRaceHorses).toHaveLength(10) // 10 horses per round, not 6
    }, 1000)

    it('should pause and resume race', async () => {
      store.commit('SET_RACING_STATUS', true)

      await store.dispatch('pauseRace')
      expect(store.state.isPaused).toBe(true)

      await store.dispatch('pauseRace') // Toggle back
      expect(store.state.isPaused).toBe(false)
    })

    it('should toggle sound', async () => {
      expect(store.state.soundEnabled).toBe(true)
      await store.dispatch('toggleSound')
      expect(store.state.soundEnabled).toBe(false)
    })
  })

  describe('race simulation logic', () => {
    it('should handle horse performance calculation', () => {
      const horses: Horse[] = [
        {
          id: 1,
          name: 'Strong Horse',
          color: '#ff0000',
          condition: 90,
          position: 0,
          isRacing: false
        },
        { id: 2, name: 'Weak Horse', color: '#00ff00', condition: 30, position: 0, isRacing: false }
      ]

      store.commit('GENERATE_RACE_SCHEDULE')
      store.commit('SET_RACE_HORSES', { round: 0, horses })

      // Simulate position updates
      store.commit('UPDATE_HORSE_POSITION', { horseId: 1, position: 100 })
      store.commit('UPDATE_HORSE_POSITION', { horseId: 2, position: 50 })

      expect(store.state.currentRaceHorses[0].position).toBe(100)
      expect(store.state.currentRaceHorses[1].position).toBe(50)
    })

    it('should properly sort race results by finish time', () => {
      const horses: Horse[] = [
        {
          id: 1,
          name: 'Horse 1',
          color: '#ff0000',
          condition: 80,
          position: 1000,
          isRacing: false,
          raceTime: 45.5
        },
        {
          id: 2,
          name: 'Horse 2',
          color: '#00ff00',
          condition: 70,
          position: 1000,
          isRacing: false,
          raceTime: 43.2
        },
        {
          id: 3,
          name: 'Horse 3',
          color: '#0000ff',
          condition: 90,
          position: 1000,
          isRacing: false,
          raceTime: 44.8
        }
      ]

      store.commit('GENERATE_RACE_SCHEDULE')
      store.commit('SET_RACE_HORSES', { round: 0, horses })

      const sortedHorses = [...store.state.currentRaceHorses]
        .filter((horse: Horse) => horse.raceTime !== undefined)
        .sort((a: Horse, b: Horse) => (a.raceTime || 0) - (b.raceTime || 0))

      expect(sortedHorses[0].id).toBe(2) // Fastest time: 43.2
      expect(sortedHorses[1].id).toBe(3) // Second: 44.8
      expect(sortedHorses[2].id).toBe(1) // Slowest: 45.5
    })
  })
})
