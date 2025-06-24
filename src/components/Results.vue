<template>
  <div v-if="raceResults.length > 0" class="results" role="region" aria-labelledby="results-title">
    <h3 id="results-title">Race Results</h3>

    <div class="results-container" role="list" aria-label="List of completed race results">
      <div v-for="(result, index) in raceResults" :key="index" class="race-result" role="listitem">
        <h4 :id="`race-${index}-title`">Round {{ result.round }} - {{ result.distance }}m</h4>

        <div
          class="podium"
          role="region"
          :aria-labelledby="`race-${index}-title`"
          aria-label="Top 3 finishers podium"
        >
          <div class="podium-places" role="list" aria-label="Podium positions">
            <div
              v-for="(place, idx) in result.results.slice(0, 3)"
              :key="idx"
              class="podium-place"
              :class="`place-${place.position}`"
              role="listitem"
              :tabindex="0"
              :aria-label="getPodiumDescription(place)"
              :aria-describedby="`podium-${index}-${idx}-details`"
              @keydown="handlePodiumKeydown"
            >
              <div class="medal" :aria-label="`${getPositionName(place.position)} place medal`">
                {{ place.position }}
              </div>
              <div
                class="horse-circle"
                :style="{ backgroundColor: place.horse.color }"
                aria-hidden="true"
              >
                🐎
              </div>
              <div class="place-info">
                <div class="horse-name">{{ place.horse.name }}</div>
                <div class="horse-stats">
                  <span>Condition: {{ place.horse.condition }}</span>
                  <span>Time: {{ place.time }}s</span>
                </div>
              </div>
              <div :id="`podium-${index}-${idx}-details`" class="sr-only">
                {{ getPositionName(place.position) }} place: {{ place.horse.name }} with condition
                {{ place.horse.condition }} finished in {{ place.time }} seconds
              </div>
            </div>
          </div>
        </div>

        <div class="full-results">
          <div id="table-description" class="sr-only">
            Complete race results table with position, horse name, condition, and finish time for
            all participants
          </div>
          <table
            class="results-table"
            role="table"
            :aria-labelledby="`race-${index}-title`"
            aria-describedby="table-description"
          >
            <thead>
              <tr role="row">
                <th scope="col" role="columnheader">Position</th>
                <th scope="col" role="columnheader">Horse</th>
                <th scope="col" role="columnheader">Condition</th>
                <th scope="col" role="columnheader">Time</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="place in result.results"
                :key="place.horse.id"
                :class="{ 'top-three': place.position <= 3 }"
                role="row"
                :tabindex="0"
                :aria-label="getTableRowDescription(place)"
                @keydown="handleTableRowKeydown"
              >
                <td class="position" role="cell">
                  <span
                    class="position-badge"
                    :class="`position-${place.position}`"
                    :aria-label="`Position ${place.position}`"
                  >
                    {{ place.position }}
                  </span>
                </td>
                <td class="horse-cell" role="cell">
                  <div
                    class="color-indicator"
                    :style="{ backgroundColor: place.horse.color }"
                    :aria-label="`Horse color: ${place.horse.color}`"
                  ></div>
                  {{ place.horse.name }}
                </td>
                <td role="cell">{{ place.horse.condition }}</td>
                <td role="cell">{{ place.time }}s</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

export default {
  name: 'Results',
  computed: {
    ...mapState(['raceResults'])
  },
  methods: {
    getPositionName(position: number): string {
      switch (position) {
        case 1:
          return 'First'
        case 2:
          return 'Second'
        case 3:
          return 'Third'
        default:
          return `${position}th`
      }
    },
    getPodiumDescription(place: any): string {
      return `${this.getPositionName(place.position)} place: ${place.horse.name}, condition ${place.horse.condition}, time ${place.time} seconds`
    },
    getTableRowDescription(place: any): string {
      return `Position ${place.position}: ${place.horse.name}, condition ${place.horse.condition}, finished in ${place.time} seconds`
    },
    handlePodiumKeydown(event: KeyboardEvent): void {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        ;(event.target as HTMLElement).focus()
      }
    },
    handleTableRowKeydown(event: KeyboardEvent): void {
      const currentRow = event.target as HTMLElement
      const table = currentRow.closest('table')
      if (!table) return

      const rows = Array.from(table.querySelectorAll('tbody tr')) as HTMLElement[]
      const currentIndex = rows.indexOf(currentRow)

      switch (event.key) {
        case 'ArrowUp':
          event.preventDefault()
          if (currentIndex > 0) {
            rows[currentIndex - 1].focus()
          }
          break
        case 'ArrowDown':
          event.preventDefault()
          if (currentIndex < rows.length - 1) {
            rows[currentIndex + 1].focus()
          }
          break
        case 'Home':
          event.preventDefault()
          rows[0]?.focus()
          break
        case 'End':
          event.preventDefault()
          rows[rows.length - 1]?.focus()
          break
        case 'Enter':
        case ' ':
          event.preventDefault()
          currentRow.focus()
          break
      }
    }
  }
}
</script>

<style scoped>
.results {
  margin-top: 20px;
}

.results h3 {
  color: #495057;
  margin-bottom: 20px;
}

.results-container {
  display: flex;
  flex-direction: column;
  gap: 30px;
}

.race-result {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  border: 1px solid #dee2e6;
}

.race-result h4 {
  color: #495057;
  margin-bottom: 15px;
  text-align: center;
}

.podium {
  margin-bottom: 20px;
}

.podium-places {
  display: flex;
  justify-content: center;
  align-items: flex-end;
  gap: 20px;
  padding: 20px;
}

.podium-place {
  display: flex;
  flex-direction: column;
  align-items: center;
  min-width: 120px;
}

.place-1 .medal {
  background: linear-gradient(45deg, #ffd700, #ffed4e);
  color: #8b6914;
}

.place-2 .medal {
  background: linear-gradient(45deg, #c0c0c0, #e8e8e8);
  color: #666;
}

.place-3 .medal {
  background: linear-gradient(45deg, #cd7f32, #daa520);
  color: #8b4513;
}

.medal {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  font-size: 18px;
  margin-bottom: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
}

.horse-circle {
  width: 60px;
  height: 60px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  margin-bottom: 10px;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  border: 3px solid white;
  transform: scaleX(-1);
}

.place-info {
  text-align: center;
}

.horse-name {
  font-weight: bold;
  margin-bottom: 5px;
  color: #495057;
}

.horse-stats {
  display: flex;
  flex-direction: column;
  gap: 2px;
  font-size: 12px;
  color: #6c757d;
}

.full-results {
  margin-top: 20px;
}

.results-table {
  width: 100%;
  border-collapse: collapse;
  background-color: white;
  border-radius: 5px;
  overflow: hidden;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.results-table th,
.results-table td {
  padding: 12px;
  text-align: left;
  border-bottom: 1px solid #dee2e6;
  vertical-align: middle;
  height: 55px;
  box-sizing: border-box;
  line-height: 31px;
}

.results-table th {
  background-color: #e9ecef;
  font-weight: bold;
  color: #495057;
}

.results-table tr:hover {
  background-color: #f8f9fa;
}

.top-three {
  background-color: #fff3cd;
}

.position {
  text-align: center;
  vertical-align: middle;
}

.position-badge {
  display: inline-flex;
  width: 30px;
  height: 30px;
  border-radius: 50%;
  align-items: center;
  justify-content: center;
  font-weight: bold;
  color: white;
  margin: 0 auto;
}

.position-1 {
  background-color: #ffd700;
  color: #8b6914;
}

.position-2 {
  background-color: #c0c0c0;
  color: #666;
}

.position-3 {
  background-color: #cd7f32;
  color: #8b4513;
}

.position-badge:not(.position-1):not(.position-2):not(.position-3) {
  background-color: #6c757d;
}

.horse-cell {
  line-height: 31px;
}

.horse-cell .color-indicator {
  display: inline-block;
  vertical-align: middle;
  margin-right: 10px;
}

.color-indicator {
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  display: inline-block;
  vertical-align: middle;
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
.podium-place:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
  border-radius: 8px;
}

.results-table tr:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
}

/* High contrast mode support */
:global(body.high-contrast) .results {
  background-color: #000000;
  color: #ffffff;
}

:global(body.high-contrast) .race-result {
  background-color: #000000;
  color: #ffffff;
  border: 2px solid #ffffff;
}

:global(body.high-contrast) .podium-place:focus {
  outline: 4px solid #ffff00;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 255, 0, 0.8);
}

:global(body.high-contrast) .results-table {
  background-color: #000000;
  color: #ffffff;
  border: 2px solid #ffffff;
}

:global(body.high-contrast) .results-table th {
  background-color: #808080;
  color: #ffffff;
  border-bottom: 2px solid #ffffff;
}

:global(body.high-contrast) .results-table td {
  border-bottom: 1px solid #ffffff;
}

:global(body.high-contrast) .results-table tr:focus {
  outline: 4px solid #ffff00;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 255, 0, 0.8);
}

:global(body.high-contrast) .top-three {
  background-color: #000080;
}

:global(body.high-contrast) .medal {
  border: 2px solid #000000;
}

:global(body.high-contrast) .position-1 {
  background-color: #ffff00;
  color: #000000;
}

:global(body.high-contrast) .position-2 {
  background-color: #c0c0c0;
  color: #000000;
}

:global(body.high-contrast) .position-3 {
  background-color: #ffa500;
  color: #000000;
}

:global(body.high-contrast) .color-indicator {
  border: 2px solid #ffffff;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .results-table tr {
    transition: none;
  }
}
</style>
