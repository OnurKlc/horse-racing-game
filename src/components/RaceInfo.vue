<template>
  <div
    v-if="hasSchedule"
    class="race-info"
    role="region"
    aria-labelledby="race-info-title"
    aria-live="polite"
  >
    <h3 v-if="!raceCompleted" id="race-info-title">Race Schedule Generated</h3>
    <h3 v-if="raceCompleted" id="race-info-title" class="completed-title">
      🏁 All Races Completed!
    </h3>

    <div
      v-if="isRacing"
      class="current-round"
      role="status"
      aria-labelledby="current-round-title"
      aria-describedby="current-round-details"
    >
      <h4 id="current-round-title">Current Round: {{ currentRound + 1 }} / 6</h4>
      <p id="current-round-details">Distance: {{ currentRaceData?.distance }}m</p>
      <div
        v-if="isPaused"
        class="paused-indicator"
        role="alert"
        aria-live="assertive"
        aria-label="Race is currently paused"
      >
        ⏸️ Race Paused
      </div>
      <div
        v-if="isWaitingBetweenRounds"
        class="waiting-indicator"
        role="status"
        aria-live="polite"
        aria-label="Preparing for next round"
      >
        ⏳ Preparing Next Round...
      </div>
    </div>

    <div
      v-if="raceCompleted"
      class="completion-message"
      role="alert"
      aria-live="polite"
      aria-labelledby="completion-title"
    >
      <div id="completion-title" class="sr-only">Race series completed</div>
      <p>All 6 rounds have been completed! Generate a new schedule to start another race series.</p>
    </div>
  </div>
</template>

<script lang="ts">
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
    hasSchedule(): boolean {
      return (this as any).raceSchedule.length > 0
    }
  },
  methods: {
    announceRaceStatus(): string {
      if ((this as any).raceCompleted) {
        return 'All races completed'
      }
      if ((this as any).isPaused) {
        return 'Race paused'
      }
      if ((this as any).isWaitingBetweenRounds) {
        return 'Preparing next round'
      }
      if ((this as any).isRacing) {
        return `Racing round ${(this as any).currentRound + 1} of 6`
      }
      return 'Race schedule ready'
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

/* Screen reader only content */
.sr-only {
  position: absolute;
  width: 1px;
  height: 1px;
  padding: 0;
  margin: -1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
  white-space: nowrap;
  border: 0;
}

/* High contrast mode support */
:global(body.high-contrast) .race-info {
  background-color: #000000;
  color: #ffffff;
  border: 2px solid #ffffff;
}

:global(body.high-contrast) .current-round {
  background-color: #808080;
  color: #ffffff;
  border: 2px solid #ffffff;
}

:global(body.high-contrast) .paused-indicator {
  background-color: #ffff00;
  color: #000000;
  border: 2px solid #000000;
}

:global(body.high-contrast) .waiting-indicator {
  background-color: #00ffff;
  color: #000000;
  border: 2px solid #000000;
}

:global(body.high-contrast) .completed-title {
  color: #00ff00;
}

:global(body.high-contrast) .completion-message {
  background-color: #008000;
  color: #ffffff;
  border: 2px solid #ffffff;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .waiting-indicator {
    animation: none;
  }
}
</style>
