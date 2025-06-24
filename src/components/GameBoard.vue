<template>
  <div class="game-board">
    <div class="controls">
      <button :disabled="isRacing" class="btn btn-primary" @click="generateSchedule">
        Generate Schedule
      </button>
      <button
        v-if="!raceCompleted"
        :disabled="!hasSchedule || isRacing"
        class="btn btn-success"
        @click="startRace"
      >
        {{ isRacing ? 'Racing...' : 'Start Race' }}
      </button>
      <button v-if="isRacing" :disabled="!isRacing" class="btn btn-warning" @click="pauseRace">
        {{ isPaused ? 'Resume' : 'Pause' }}
      </button>
    </div>

    <RaceInfo />

    <HorseList v-if="!isRacing" />

    <RaceTrack v-if="isRacing" />

    <RaceSchedule v-if="!isRacing" />

    <Results />
  </div>
</template>

<script>
import { mapState, mapActions, mapGetters } from 'vuex'
import RaceTrack from './RaceTrack.vue'
import Results from './Results.vue'
import HorseList from './HorseList.vue'
import RaceSchedule from './RaceSchedule.vue'
import RaceInfo from './RaceInfo.vue'

export default {
  name: 'GameBoard',
  components: {
    RaceTrack,
    Results,
    HorseList,
    RaceSchedule,
    RaceInfo
  },
  computed: {
    ...mapState(['raceSchedule', 'isRacing', 'isPaused', 'raceCompleted', 'currentRound']),
    ...mapGetters(['currentRaceData']),
    hasSchedule() {
      return this.raceSchedule.length > 0
    }
  },
  methods: {
    ...mapActions(['generateRaceSchedule', 'startRace', 'pauseRace']),
    generateSchedule() {
      this.generateRaceSchedule()
    }
  }
}
</script>

<style scoped>
.game-board {
  padding: 20px;
  width: 100%;
  box-sizing: border-box;
}

.controls {
  display: flex;
  gap: 10px;
  margin-bottom: 20px;
}

.btn {
  padding: 10px 20px;
  border: none;
  border-radius: 5px;
  cursor: pointer;
  font-size: 16px;
  transition: background-color 0.3s;
}

.btn:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}

.btn-primary {
  background-color: #007bff;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #0056b3;
}

.btn-success {
  background-color: #28a745;
  color: white;
}

.btn-success:hover:not(:disabled) {
  background-color: #1e7e34;
}

.btn-warning {
  background-color: #ffc107;
  color: #212529;
}

.btn-warning:hover:not(:disabled) {
  background-color: #e0a800;
}
</style>
