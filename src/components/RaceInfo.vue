<template>
  <div v-if="hasSchedule" class="race-info">
    <h3 v-if="!raceCompleted">Race Schedule Generated</h3>
    <h3 v-if="raceCompleted" class="completed-title">🏁 All Races Completed!</h3>

    <div v-if="isRacing" class="current-round">
      <h4>Current Round: {{ currentRound + 1 }} / 6</h4>
      <p>Distance: {{ currentRaceData?.distance }}m</p>
      <div v-if="isPaused" class="paused-indicator">⏸️ Race Paused</div>
      <div v-if="isWaitingBetweenRounds" class="waiting-indicator">⏳ Preparing Next Round...</div>
    </div>

    <div v-if="raceCompleted" class="completion-message">
      <p>All 6 rounds have been completed! Generate a new schedule to start another race series.</p>
    </div>
  </div>
</template>

<script>
import { mapState, mapGetters } from 'vuex'

export default {
  name: 'RaceInfo',
  computed: {
    ...mapState([
      'raceSchedule',
      'isRacing',
      'isPaused',
      'isWaitingBetweenRounds',
      'raceCompleted',
      'currentRound'
    ]),
    ...mapGetters(['currentRaceData']),
    hasSchedule() {
      return this.raceSchedule.length > 0
    }
  }
}
</script>

<style scoped>
.race-info {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  margin-bottom: 20px;
}

.race-info h3 {
  margin: 0 0 10px 0;
  color: #495057;
}

.current-round {
  background-color: #e9ecef;
  padding: 10px;
  border-radius: 5px;
  margin-top: 10px;
}

.current-round h4 {
  margin: 0 0 5px 0;
  color: #495057;
}

.current-round p {
  margin: 0;
  color: #6c757d;
}

.paused-indicator {
  background-color: #fff3cd;
  color: #856404;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #ffeaa7;
}

.waiting-indicator {
  background-color: #d1ecf1;
  color: #0c5460;
  padding: 8px;
  border-radius: 4px;
  margin-top: 8px;
  text-align: center;
  font-weight: bold;
  border: 1px solid #bee5eb;
  animation: pulse 1.5s ease-in-out infinite;
}

@keyframes pulse {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0.7;
  }
}

.completed-title {
  color: #28a745;
  text-align: center;
  margin-bottom: 15px;
}

.completion-message {
  background-color: #d4edda;
  color: #155724;
  padding: 15px;
  border-radius: 5px;
  border: 1px solid #c3e6cb;
  text-align: center;
}

.completion-message p {
  margin: 0;
  font-weight: 500;
}
</style>
