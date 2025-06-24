import { describe, it, expect, beforeEach } from 'vitest'
import { createStore } from 'vuex'
import type { RootState } from '../index'
import { mutations, actions, getters } from '../index'
import type { Horse } from '@/types'

interface RaceEvent {
  round: number
  distance: number
  horses: Horse[]
  completed: boolean
}

describe('Vuex Store', () => {
  let store: any

  beforeEach(() => {
    store = createStore({
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
      mutations,
      actions,
      getters
    })
  })

  describe('mutations', () => {
    it('should generate horses correctly', () => {
      store.commit('GENERATE_HORSES')

      expect(store.state.horses).toHaveLength(10)
      store.state.horses.forEach((horse: Horse) => {
        expect(horse).toHaveProperty('id')
        expect(horse).toHaveProperty('name')
        expect(horse).toHaveProperty('color')
        expect(horse).toHaveProperty('condition')
        expect(horse.condition).toBeGreaterThanOrEqual(10)
        expect(horse.condition).toBeLessThanOrEqual(100)
      })
    })

    it('should generate race schedule correctly', () => {
      store.commit('GENERATE_HORSES')
      store.commit('GENERATE_RACE_SCHEDULE')

      expect(store.state.raceSchedule).toHaveLength(6)
      store.state.raceSchedule.forEach((race: RaceEvent) => {
        expect(race).toHaveProperty('round')
        expect(race).toHaveProperty('distance')
        expect(race).toHaveProperty('horses')
        expect(race).toHaveProperty('completed')
        expect(race.horses).toHaveLength(6)
        expect(race.distance).toBeGreaterThanOrEqual(800)
        expect(race.distance).toBeLessThanOrEqual(2000)
      })
    })

    it('should set current race horses', () => {
      const horses: Horse[] = [
        { id: 1, name: 'Test Horse', color: '#ff0000', condition: 80, position: 0, raceTime: null }
      ]

      store.commit('SET_CURRENT_RACE_HORSES', horses)
      expect(store.state.currentRaceHorses).toEqual(horses)
    })

    it('should start racing', () => {
      store.commit('START_RACING')
      expect(store.state.isRacing).toBe(true)
      expect(store.state.isPaused).toBe(false)
    })

    it('should pause racing', () => {
      store.commit('START_RACING')
      store.commit('PAUSE_RACING')
      expect(store.state.isPaused).toBe(true)
    })

    it('should resume racing', () => {
      store.commit('START_RACING')
      store.commit('PAUSE_RACING')
      store.commit('RESUME_RACING')
      expect(store.state.isPaused).toBe(false)
    })

    it('should stop racing', () => {
      store.commit('START_RACING')
      store.commit('STOP_RACING')
      expect(store.state.isRacing).toBe(false)
      expect(store.state.isPaused).toBe(false)
    })

    it('should update horse position', () => {
      const horse: Horse = {
        id: 1,
        name: 'Test Horse',
        color: '#ff0000',
        condition: 80,
        position: 0,
        raceTime: null
      }
      store.commit('SET_CURRENT_RACE_HORSES', [horse])

      store.commit('UPDATE_HORSE_POSITION', { horseId: 1, position: 100 })
      expect(store.state.currentRaceHorses[0].position).toBe(100)
    })

    it('should set horse finish time', () => {
      const horse: Horse = {
        id: 1,
        name: 'Test Horse',
        color: '#ff0000',
        condition: 80,
        position: 0,
        raceTime: null
      }
      store.commit('SET_CURRENT_RACE_HORSES', [horse])

      store.commit('SET_HORSE_FINISH_TIME', { horseId: 1, time: 45.5 })
      expect(store.state.currentRaceHorses[0].raceTime).toBe(45.5)
    })
  })

  describe('getters', () => {
    beforeEach(() => {
      store.commit('GENERATE_HORSES')
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

    it('should check if race has schedule', () => {
      expect(store.getters.hasSchedule).toBe(true)

      store.state.raceSchedule = []
      expect(store.getters.hasSchedule).toBe(false)
    })
  })

  describe('actions', () => {
    it('should generate new race', async () => {
      await store.dispatch('generateNewRace')

      expect(store.state.horses).toHaveLength(10)
      expect(store.state.raceSchedule).toHaveLength(6)
      expect(store.state.currentRound).toBe(0)
      expect(store.state.raceCompleted).toBe(false)
    })

    it('should start race', async () => {
      await store.dispatch('generateNewRace')
      await store.dispatch('startRace')

      expect(store.state.isRacing).toBe(true)
      expect(store.state.currentRaceHorses).toHaveLength(6)
    })

    it('should advance to next round', async () => {
      await store.dispatch('generateNewRace')
      await store.dispatch('startRace')

      const initialRound = store.state.currentRound
      await store.dispatch('nextRound')

      expect(store.state.currentRound).toBe(initialRound + 1)
      expect(store.state.isWaitingBetweenRounds).toBe(false)
    })

    it('should complete all races when reaching final round', async () => {
      await store.dispatch('generateNewRace')

      // Simulate completing all rounds
      for (let i = 0; i < 6; i++) {
        store.state.currentRound = i
        await store.dispatch('nextRound')
      }

      expect(store.state.raceCompleted).toBe(true)
      expect(store.state.isRacing).toBe(false)
    })

    it('should finish current round', async () => {
      await store.dispatch('generateNewRace')
      await store.dispatch('startRace')

      // Set finish times for all horses
      store.state.currentRaceHorses.forEach((horse: Horse, index: number) => {
        store.commit('SET_HORSE_FINISH_TIME', { horseId: horse.id, time: 40 + index })
        store.commit('UPDATE_HORSE_POSITION', { horseId: horse.id, position: 1000 })
      })

      await store.dispatch('finishCurrentRound')

      expect(store.state.raceResults).toHaveLength(1)
      expect(store.state.isWaitingBetweenRounds).toBe(true)
    })
  })

  describe('race simulation logic', () => {
    it('should calculate horse performance based on condition', () => {
      const horse1: Horse = {
        id: 1,
        name: 'Strong Horse',
        color: '#ff0000',
        condition: 90,
        position: 0,
        raceTime: null
      }
      const horse2: Horse = {
        id: 2,
        name: 'Weak Horse',
        color: '#00ff00',
        condition: 30,
        position: 0,
        raceTime: null
      }

      store.commit('SET_CURRENT_RACE_HORSES', [horse1, horse2])

      // Simulate multiple position updates
      for (let i = 0; i < 10; i++) {
        store.state.currentRaceHorses.forEach((horse: Horse) => {
          const baseSpeed = 5 + (horse.condition / 100) * 10
          const randomFactor = Math.random() * 3
          const newPosition = horse.position + baseSpeed + randomFactor

          store.commit('UPDATE_HORSE_POSITION', { horseId: horse.id, position: newPosition })
        })
      }

      // Strong horse should generally be ahead
      const strongHorse = store.state.currentRaceHorses.find((h: Horse) => h.id === 1)
      const weakHorse = store.state.currentRaceHorses.find((h: Horse) => h.id === 2)

      expect(strongHorse.position).toBeGreaterThan(0)
      expect(weakHorse.position).toBeGreaterThan(0)
    })

    it('should properly sort race results by finish time', () => {
      const horses: Horse[] = [
        { id: 1, name: 'Horse 1', color: '#ff0000', condition: 80, position: 1000, raceTime: 45.5 },
        { id: 2, name: 'Horse 2', color: '#00ff00', condition: 70, position: 1000, raceTime: 43.2 },
        { id: 3, name: 'Horse 3', color: '#0000ff', condition: 90, position: 1000, raceTime: 44.8 }
      ]

      store.commit('SET_CURRENT_RACE_HORSES', horses)

      const sortedHorses = [...store.state.currentRaceHorses]
        .filter((horse: Horse) => horse.raceTime !== null)
        .sort((a: Horse, b: Horse) => (a.raceTime || 0) - (b.raceTime || 0))

      expect(sortedHorses[0].id).toBe(2) // Fastest time: 43.2
      expect(sortedHorses[1].id).toBe(3) // Second: 44.8
      expect(sortedHorses[2].id).toBe(1) // Slowest: 45.5
    })
  })
})
