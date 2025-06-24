import { createStore } from 'vuex'

const generateHorses = () => {
  const colors = [
    '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8',
    '#F7DC6F', '#BB8FCE', '#85C1E9', '#F8C471', '#82E0AA',
    '#F1948A', '#AED6F1', '#A9DFBF', '#F9E79F', '#D2B4DE',
    '#AED6F1', '#FADBD8', '#D5DBDB', '#FCF3CF', '#EBDEF0'
  ]
  
  return Array.from({ length: 20 }, (_, index) => ({
    id: index + 1,
    name: `Horse ${index + 1}`,
    color: colors[index],
    condition: Math.floor(Math.random() * 100) + 1,
    position: 0,
    isRacing: false
  }))
}

const RACE_DISTANCES = [1200, 1400, 1600, 1800, 2000, 2200]

export default createStore({
  state: {
    horses: generateHorses(),
    raceSchedule: [],
    currentRound: 0,
    isRacing: false,
    isPaused: false,
    isWaitingBetweenRounds: false,
    raceCompleted: false,
    raceResults: [],
    currentRaceHorses: []
  },

  mutations: {
    GENERATE_RACE_SCHEDULE(state) {
      state.raceSchedule = RACE_DISTANCES.map((distance, index) => ({
        round: index + 1,
        distance,
        horses: [],
        results: null,
        completed: false
      }))
      state.currentRound = 0
      state.raceResults = []
      state.raceCompleted = false
    },

    SET_CURRENT_ROUND(state, round) {
      state.currentRound = round
    },

    SET_RACING_STATUS(state, status) {
      state.isRacing = status
    },

    SET_PAUSED_STATUS(state, status) {
      state.isPaused = status
    },

    SET_WAITING_STATUS(state, status) {
      state.isWaitingBetweenRounds = status
    },

    SET_RACE_COMPLETED(state, status) {
      state.raceCompleted = status
    },

    SET_RACE_HORSES(state, { round, horses }) {
      if (state.raceSchedule[round]) {
        state.raceSchedule[round].horses = horses
      }
      state.currentRaceHorses = horses
    },

    UPDATE_HORSE_POSITION(state, { horseId, position }) {
      const horse = state.currentRaceHorses.find(h => h.id === horseId)
      if (horse) {
        horse.position = position
      }
    },

    COMPLETE_RACE(state, { round, results }) {
      if (state.raceSchedule[round]) {
        state.raceSchedule[round].results = results
        state.raceSchedule[round].completed = true
      }
      state.raceResults.push({
        round: round + 1,
        distance: RACE_DISTANCES[round],
        results
      })
    },

    RESET_HORSE_POSITIONS(state) {
      state.currentRaceHorses.forEach(horse => {
        horse.position = 0
      })
    }
  },

  actions: {
    generateRaceSchedule({ commit, state }) {
      commit('GENERATE_RACE_SCHEDULE')
      
      // Select 10 random horses for each round
      state.raceSchedule.forEach((race, index) => {
        const availableHorses = [...state.horses]
        const selectedHorses = []
        
        for (let i = 0; i < 10; i++) {
          const randomIndex = Math.floor(Math.random() * availableHorses.length)
          selectedHorses.push({ ...availableHorses[randomIndex], position: 0 })
          availableHorses.splice(randomIndex, 1)
        }
        
        commit('SET_RACE_HORSES', { round: index, horses: selectedHorses })
      })
    },

    async startRace({ commit, state, dispatch }) {
      if (state.isRacing) return
      
      commit('SET_RACING_STATUS', true)
      commit('SET_PAUSED_STATUS', false)
      
      for (let round = 0; round < state.raceSchedule.length; round++) {
        commit('SET_CURRENT_ROUND', round)
        const raceData = state.raceSchedule[round]
        commit('SET_RACE_HORSES', { round, horses: raceData.horses })
        
        await dispatch('runSingleRace', { round, distance: raceData.distance })
        
        // Wait 3 seconds between rounds (except after the last round)
        if (round < state.raceSchedule.length - 1) {
          commit('SET_WAITING_STATUS', true)
          await new Promise(resolve => setTimeout(resolve, 3000))
          commit('SET_WAITING_STATUS', false)
        }
      }
      
      commit('SET_RACING_STATUS', false)
      commit('SET_RACE_COMPLETED', true)
    },

    async runSingleRace({ commit, state }, { round, distance }) {
      const horses = state.currentRaceHorses
      commit('RESET_HORSE_POSITIONS')
      
      // Initialize race time tracking
      let raceStartTime = Date.now()
      let totalPausedTime = 0
      let pauseStartTime = null
      
      horses.forEach(horse => {
        horse.raceTime = null
        horse.finished = false
      })
      
      return new Promise((resolve) => {
        const raceInterval = setInterval(() => {
          const currentTime = Date.now()
          
          // Handle pause timing
          if (state.isPaused) {
            if (pauseStartTime === null) {
              pauseStartTime = currentTime
            }
            return // Skip this iteration but keep the interval running
          } else if (pauseStartTime !== null) {
            // Just resumed from pause
            totalPausedTime += currentTime - pauseStartTime
            pauseStartTime = null
          }
          
          let raceFinished = true
          
          horses.forEach(horse => {
            if (horse.position < distance && !horse.finished) {
              // More balanced speed calculation with increased randomness
              const baseSpeed = (horse.condition / 100) * 8 // Reduced from 15 to 8
              const randomFactor = Math.random() * 15 // Increased from 10 to 15
              const surpriseFactor = Math.random() < 0.1 ? Math.random() * 8 : 0 // 10% chance of extra burst
              const fatigueFactor = horse.position > (distance * 0.7) ? Math.random() * -3 : 0 // Late race fatigue
              
              const speed = Math.max(1, baseSpeed + randomFactor + surpriseFactor + fatigueFactor)
              horse.position = Math.min(horse.position + speed, distance)
              commit('UPDATE_HORSE_POSITION', { horseId: horse.id, position: horse.position })
              
              // Check if horse finished
              if (horse.position >= distance && !horse.finished) {
                horse.finished = true
                // Calculate actual race time excluding paused time
                horse.raceTime = (currentTime - raceStartTime - totalPausedTime) / 1000
              }
              
              if (!horse.finished) {
                raceFinished = false
              }
            }
          })
          
          if (raceFinished) {
            clearInterval(raceInterval)
            
            // Sort by race time (fastest first)
            const results = horses
              .filter(horse => horse.raceTime !== null)
              .sort((a, b) => a.raceTime - b.raceTime)
              .map((horse, index) => ({
                position: index + 1,
                horse: { ...horse },
                time: horse.raceTime.toFixed(2)
              }))
            
            commit('COMPLETE_RACE', { round, results })
            resolve()
          }
        }, 100)
      })
    },

    pauseRace({ commit, state }) {
      if (state.isRacing) {
        commit('SET_PAUSED_STATUS', !state.isPaused)
      }
    }
  },

  getters: {
    currentRaceData: (state) => {
      return state.raceSchedule[state.currentRound] || null
    },
    
    isLastRound: (state) => {
      return state.currentRound >= state.raceSchedule.length - 1
    }
  }
})