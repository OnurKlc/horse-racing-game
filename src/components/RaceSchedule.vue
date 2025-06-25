<template>
  <div v-if="hasSchedule" class="race-schedule" role="region" aria-labelledby="schedule-title">
    <h3 id="schedule-title">Race Schedule</h3>
    <div class="schedule-grid" role="list" aria-label="List of scheduled races">
      <div
        v-for="(race, index) in raceSchedule"
        :key="index"
        class="race-item"
        :class="{ completed: race.completed }"
        role="listitem"
        :tabindex="0"
        :aria-label="getRaceItemDescription(race)"
        :aria-describedby="`race-${index}-details`"
        @keydown="handleRaceItemKeydown"
      >
        <h4>Round {{ race.round }}</h4>
        <p>{{ race.distance }}m</p>
        <p>{{ race.horses.length }} horses</p>

        <div
          v-if="race.horses.length > 0"
          class="horses-list"
          :aria-labelledby="`horses-${index}-title`"
        >
          <div id="`horses-${index}-title`" class="sr-only">Participating horses:</div>
          <div
            class="horses-grid"
            role="list"
            :aria-label="`${race.horses.length} horses participating in round ${race.round}`"
          >
            <div
              v-for="horse in getSortedHorses(race.horses)"
              :key="horse.id"
              class="horse-item"
              role="listitem"
              :aria-label="`${horse.name} with color ${horse.color}`"
            >
              <div
                class="horse-indicator"
                :style="{ backgroundColor: horse.color }"
                aria-hidden="true"
              >
                🐎
              </div>
              <span class="horse-name">{{ horse.name }}</span>
            </div>
          </div>
        </div>

        <div :id="`race-${index}-details`" class="sr-only">
          Round {{ race.round }}: {{ race.distance }} meter race with
          {{ race.horses.length }} horses.
          {{ race.completed ? 'Race completed.' : 'Race scheduled.' }}
          Horses: {{ race.horses.map((h: any) => h.name).join(', ') }}
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'
import type { Horse } from '@/types'

export default {
  name: 'RaceSchedule',
  computed: {
    ...mapState(['raceSchedule']),
    hasSchedule(): boolean {
      return (this as any).raceSchedule.length > 0
    }
  },
  methods: {
    getSortedHorses(horses: Horse[]): Horse[] {
      return [...horses].sort((a, b) => a.id - b.id)
    },
    getRaceItemDescription(race: any): string {
      const status = race.completed ? 'Completed' : 'Scheduled'
      return `${status} - Round ${race.round}, ${race.distance} meters, ${race.horses.length} horses`
    },
    handleRaceItemKeydown(event: KeyboardEvent): void {
      const currentItem = event.target as HTMLElement
      const grid = currentItem.parentElement
      if (!grid) return

      const items = Array.from(grid.querySelectorAll('.race-item')) as HTMLElement[]
      const currentIndex = items.indexOf(currentItem)

      switch (event.key) {
        case 'ArrowLeft':
        case 'ArrowUp':
          event.preventDefault()
          if (currentIndex > 0) {
            items[currentIndex - 1].focus()
          }
          break
        case 'ArrowRight':
        case 'ArrowDown':
          event.preventDefault()
          if (currentIndex < items.length - 1) {
            items[currentIndex + 1].focus()
          }
          break
        case 'Home':
          event.preventDefault()
          items[0]?.focus()
          break
        case 'End':
          event.preventDefault()
          items[items.length - 1]?.focus()
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          currentItem.focus()
          break
      }
    }
  }
}
</script>

<style scoped>
.race-schedule {
  margin-bottom: 20px;
}

.race-schedule h3 {
  color: #495057;
  margin-bottom: 15px;
}

.schedule-grid {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 10px;
  margin-top: 10px;
}

.race-item {
  background-color: #f8f9fa;
  padding: 15px;
  border-radius: 5px;
  text-align: center;
  border: 2px solid transparent;
  transition: all 0.3s ease;
  min-height: 200px;
  display: flex;
  flex-direction: column;
}

.race-item:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.race-item.completed {
  background-color: #d4edda;
  border-color: #28a745;
}

.race-item h4 {
  margin: 0 0 5px 0;
  color: #495057;
}

.race-item p {
  margin: 5px 0;
  color: #6c757d;
}

.horses-list {
  margin-top: 10px;
  padding-top: 10px;
  border-top: 1px solid #dee2e6;
  flex: 1;
  display: flex;
  flex-direction: column;
}

.horses-grid {
  display: grid;
  grid-template-columns: repeat(2, 1fr);
  gap: 5px;
  max-height: 120px;
  overflow-y: auto;
}

.horse-item {
  display: flex;
  align-items: center;
  gap: 5px;
  font-size: 12px;
}

.horse-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  border: 2px solid white;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  transform: scaleX(-1);
}

.horse-name {
  color: #495057;
  font-weight: 500;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
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
.race-item:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
}

/* High contrast mode support */
:global(body.high-contrast) .race-schedule {
  background-color: #000000;
  color: #ffffff;
}

:global(body.high-contrast) .race-schedule h3 {
  color: #ffffff !important;
}

:global(body.high-contrast) .race-item {
  background-color: #000000;
  color: #ffffff !important;
  border: 2px solid #ffffff;
}

:global(body.high-contrast) .race-item h4 {
  color: #ffffff !important;
}

:global(body.high-contrast) .race-item p {
  color: #ffffff !important;
}

:global(body.high-contrast) .horse-name {
  color: #ffffff !important;
}

:global(body.high-contrast) .race-item:focus {
  outline: 4px solid #ffff00;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 255, 0, 0.8);
}

:global(body.high-contrast) .race-item.completed {
  background-color: #008000;
  border-color: #ffffff;
}

:global(body.high-contrast) .horses-list {
  border-top: 1px solid #ffffff;
}

:global(body.high-contrast) .horse-indicator {
  border: 2px solid #ffffff;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .race-item {
    transition: none;
  }
}
</style>
