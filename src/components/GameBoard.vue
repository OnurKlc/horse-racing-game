<template>
  <div class="game-board" role="main" aria-label="Horse Racing Game">
    <div class="controls" role="toolbar" aria-label="Race controls">
      <button
        :disabled="isRacing"
        class="btn btn-primary"
        :aria-describedby="
          isRacing ? 'generate-schedule-help racing-status' : 'generate-schedule-help'
        "
        @click="generateSchedule"
        @keydown="handleKeydown"
      >
        Generate Schedule
      </button>
      <button
        v-if="!raceCompleted"
        :disabled="!hasSchedule || isRacing"
        class="btn btn-success"
        :aria-describedby="!hasSchedule ? 'start-race-help schedule-required' : 'start-race-help'"
        @click="startRace"
        @keydown="handleKeydown"
      >
        {{ isRacing ? 'Racing...' : 'Start Race' }}
      </button>
      <button
        v-if="isRacing"
        :disabled="!isRacing"
        class="btn btn-warning"
        aria-describedby="pause-race-help race-status"
        @click="pauseRace"
        @keydown="handleKeydown"
      >
        {{ isPaused ? 'Resume' : 'Pause' }}
      </button>
      <button
        class="btn btn-sound"
        :class="{ muted: !soundEnabled }"
        aria-describedby="sound-toggle-help"
        :aria-checked="soundEnabled"
        role="switch"
        @click="toggleSound"
        @keydown="handleKeydown"
      >
        {{ soundEnabled ? '🔊' : '🔇' }} {{ soundEnabled ? 'Sound On' : 'Sound Off' }}
      </button>
      <button
        class="btn btn-contrast"
        aria-describedby="contrast-toggle-help"
        :aria-checked="highContrast"
        role="switch"
        @click="toggleHighContrast"
        @keydown="handleKeydown"
      >
        {{ highContrast ? '🌗' : '🌑' }} {{ highContrast ? 'High Contrast' : 'Normal View' }}
      </button>
    </div>

    <!-- Screen reader announcements -->
    <div id="racing-status" class="sr-only" aria-live="polite">
      {{ isRacing ? 'Race is currently in progress' : '' }}
    </div>
    <div id="schedule-required" class="sr-only">
      Generate a schedule first before starting the race
    </div>
    <div id="race-status" class="sr-only" aria-live="polite">
      {{ isPaused ? 'Race is paused' : isRacing ? 'Race is running' : '' }}
    </div>
    <div id="race-announcements" class="sr-only" aria-live="assertive">
      {{ raceAnnouncement }}
    </div>

    <!-- Button help text -->
    <div id="generate-schedule-help" class="sr-only">
      Creates a new schedule with 6 races featuring different horses and distances
    </div>
    <div id="start-race-help" class="sr-only">
      Begins the horse race simulation with the current schedule
    </div>
    <div id="pause-race-help" class="sr-only">
      {{ isPaused ? 'Resume the paused race' : 'Pause the currently running race' }}
    </div>
    <div id="sound-toggle-help" class="sr-only">
      {{
        soundEnabled
          ? 'Turn off race sound effects and audio feedback'
          : 'Turn on race sound effects and audio feedback'
      }}
    </div>
    <div id="contrast-toggle-help" class="sr-only">
      {{
        highContrast
          ? 'Switch back to normal color scheme'
          : 'Switch to high contrast mode for better visibility'
      }}
    </div>

    <RaceInfo />

    <HorseList v-if="!isRacing" />

    <RaceTrack v-if="isRacing" />

    <RaceSchedule v-if="!isRacing" />

    <Results />

    <ConfettiEffect
      :trigger="showConfetti"
      :colors="lastWinner ? [lastWinner.color] : []"
      aria-hidden="true"
      @finished="hideConfetti"
    />
  </div>
</template>

<script lang="ts">
import { mapState, mapActions, mapGetters } from 'vuex'
import RaceTrack from './RaceTrack.vue'
import Results from './Results.vue'
import HorseList from './HorseList.vue'
import RaceSchedule from './RaceSchedule.vue'
import RaceInfo from './RaceInfo.vue'
import ConfettiEffect from './ConfettiEffect.vue'

export default {
  name: 'GameBoard',
  components: {
    RaceTrack,
    Results,
    HorseList,
    RaceSchedule,
    RaceInfo,
    ConfettiEffect
  },
  data() {
    return {
      highContrast: false,
      raceAnnouncement: '',
      focusedButtonIndex: 0
    }
  },
  computed: {
    ...mapState([
      'raceSchedule',
      'isRacing',
      'isPaused',
      'raceCompleted',
      'currentRound',
      'soundEnabled',
      'showConfetti',
      'lastWinner'
    ]),
    ...mapGetters(['currentRaceData']),
    hasSchedule(): boolean {
      return (this as any).raceSchedule.length > 0
    }
  },
  watch: {
    isRacing(newVal: boolean) {
      if (newVal) {
        this.raceAnnouncement = 'Race has started!'
      }
    },
    isPaused(newVal: boolean) {
      this.raceAnnouncement = newVal ? 'Race paused' : 'Race resumed'
    },
    raceCompleted(newVal: boolean) {
      if (newVal) {
        this.raceAnnouncement = 'All races completed!'
      }
    },
    highContrast() {
      this.updateBodyClass()
    }
  },
  mounted() {
    document.addEventListener('keydown', this.handleGlobalKeydown)
    this.updateBodyClass()
  },
  beforeUnmount() {
    document.removeEventListener('keydown', this.handleGlobalKeydown)
  },
  methods: {
    ...mapActions([
      'generateRaceSchedule',
      'startRace',
      'pauseRace',
      'toggleSound',
      'hideConfetti'
    ]),
    generateSchedule(): void {
      ;(this as any).generateRaceSchedule()
      this.raceAnnouncement = 'New race schedule generated'
    },
    toggleHighContrast(): void {
      this.highContrast = !this.highContrast
      this.updateBodyClass()
      this.raceAnnouncement = `High contrast mode ${this.highContrast ? 'enabled' : 'disabled'}`
    },
    updateBodyClass(): void {
      if (this.highContrast) {
        document.body.classList.add('high-contrast')
      } else {
        document.body.classList.remove('high-contrast')
      }
    },
    handleKeydown(event: KeyboardEvent): void {
      // Handle Enter and Space for button activation
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        ;(event.target as HTMLButtonElement).click()
      }
    },
    handleGlobalKeydown(event: KeyboardEvent): void {
      const buttons = document.querySelectorAll(
        '.controls button:not([disabled])'
      ) as NodeListOf<HTMLButtonElement>

      if (buttons.length === 0) return

      switch (event.key) {
        case 'Tab':
          // Let native tab behavior work
          break
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          this.focusedButtonIndex = (this.focusedButtonIndex - 1 + buttons.length) % buttons.length
          buttons[this.focusedButtonIndex].focus()
          break
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          this.focusedButtonIndex = (this.focusedButtonIndex + 1) % buttons.length
          buttons[this.focusedButtonIndex].focus()
          break
        case 'Home':
          event.preventDefault()
          this.focusedButtonIndex = 0
          buttons[0].focus()
          break
        case 'End':
          event.preventDefault()
          this.focusedButtonIndex = buttons.length - 1
          buttons[buttons.length - 1].focus()
          break
        case 'Escape':
          ;(document.activeElement as HTMLElement)?.blur()
          break
      }
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
  background-color: #0056b3;
  color: white;
}

.btn-primary:hover:not(:disabled) {
  background-color: #004085;
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

.btn-sound {
  background-color: #6c757d;
  color: white;
  font-size: 14px;
}

.btn-sound:hover {
  background-color: #545b62;
}

.btn-sound.muted {
  background-color: #dc3545;
}

.btn-sound.muted:hover {
  background-color: #c82333;
}

.btn-contrast {
  background-color: #138496;
  color: white;
  font-size: 14px;
}

.btn-contrast:hover {
  background-color: #0f6674;
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

/* Focus styles for accessibility */
.btn:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
}

/* High contrast styles are now in global CSS file */

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .btn {
    transition: none;
  }

  * {
    animation-duration: 0.01ms !important;
    animation-iteration-count: 1 !important;
    transition-duration: 0.01ms !important;
  }
}
</style>
