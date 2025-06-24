<template>
  <div class="game-board" role="main" aria-label="Horse Racing Game">
    <div class="controls" role="toolbar" aria-label="Race controls">
      <button
        :disabled="isRacing"
        class="btn btn-primary"
        aria-label="Generate new race schedule"
        :aria-describedby="isRacing ? 'racing-status' : undefined"
        @click="generateSchedule"
        @keydown="handleKeydown"
      >
        Generate Schedule
      </button>
      <button
        v-if="!raceCompleted"
        :disabled="!hasSchedule || isRacing"
        class="btn btn-success"
        aria-label="Start the horse race"
        :aria-describedby="!hasSchedule ? 'schedule-required' : undefined"
        @click="startRace"
        @keydown="handleKeydown"
      >
        {{ isRacing ? 'Racing...' : 'Start Race' }}
      </button>
      <button
        v-if="isRacing"
        :disabled="!isRacing"
        class="btn btn-warning"
        :aria-label="isPaused ? 'Resume the race' : 'Pause the race'"
        aria-describedby="race-status"
        @click="pauseRace"
        @keydown="handleKeydown"
      >
        {{ isPaused ? 'Resume' : 'Pause' }}
      </button>
      <button
        class="btn btn-sound"
        :class="{ muted: !soundEnabled }"
        :aria-label="soundEnabled ? 'Disable sound effects' : 'Enable sound effects'"
        :aria-pressed="soundEnabled"
        role="switch"
        @click="toggleSound"
        @keydown="handleKeydown"
      >
        {{ soundEnabled ? '🔊' : '🔇' }} {{ soundEnabled ? 'Sound On' : 'Sound Off' }}
      </button>
      <button
        class="btn btn-contrast"
        :aria-label="highContrast ? 'Disable high contrast mode' : 'Enable high contrast mode'"
        :aria-pressed="highContrast"
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
  background-color: #17a2b8;
  color: white;
  font-size: 14px;
}

.btn-contrast:hover {
  background-color: #138496;
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

/* Enhanced focus for high contrast mode */
:global(body.high-contrast) .btn:focus {
  outline: 4px solid #ffff00;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 255, 0, 0.8);
}

/* High contrast button styles */
:global(body.high-contrast) .btn {
  border: 2px solid #000000;
  font-weight: bold;
}

:global(body.high-contrast) .btn-primary {
  background-color: #000080;
  color: #ffffff;
  border-color: #ffffff;
}

:global(body.high-contrast) .btn-success {
  background-color: #008000;
  color: #ffffff;
  border-color: #ffffff;
}

:global(body.high-contrast) .btn-warning {
  background-color: #ffa500;
  color: #000000;
  border-color: #000000;
}

:global(body.high-contrast) .btn-sound {
  background-color: #800080;
  color: #ffffff;
  border-color: #ffffff;
}

:global(body.high-contrast) .btn-sound.muted {
  background-color: #ff0000;
  color: #ffffff;
  border-color: #ffffff;
}

:global(body.high-contrast) .btn-contrast {
  background-color: #008080;
  color: #ffffff;
  border-color: #ffffff;
}

:global(body.high-contrast) .btn:disabled {
  background-color: #808080;
  color: #c0c0c0;
  border-color: #c0c0c0;
}

/* High contrast mode global styles */
:global(body.high-contrast) {
  background-color: #000000;
  color: #ffffff;
}

:global(body.high-contrast) .game-board {
  background-color: #000000;
  color: #ffffff;
}

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
