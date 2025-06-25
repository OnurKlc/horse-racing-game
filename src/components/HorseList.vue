<template>
  <div class="horse-list" role="region" aria-labelledby="horse-list-title">
    <h3 id="horse-list-title">Available Horses ({{ horses.length }})</h3>

    <div class="horses-grid" role="list" aria-label="List of horses with their conditions">
      <div
        v-for="horse in horses"
        :key="horse.id"
        class="horse-card"
        :class="{ racing: horse.isRacing }"
        role="listitem"
        :tabindex="horse.isRacing ? -1 : 0"
        :aria-label="`${horse.name}, condition ${horse.condition} out of 100, ${getConditionDescription(horse.condition)}`"
        :aria-describedby="`horse-${horse.id}-details`"
        @keydown="handleCardKeydown"
      >
        <div class="horse-avatar" :style="{ backgroundColor: horse.color }" aria-hidden="true">
          🐎
        </div>

        <div class="horse-details">
          <h4>{{ horse.name }}</h4>
          <div class="condition-bar">
            <div class="condition-label">Condition: {{ horse.condition }}/100</div>
            <div
              class="condition-progress"
              role="progressbar"
              :aria-valuenow="horse.condition"
              aria-valuemin="0"
              aria-valuemax="100"
              :aria-label="`Horse condition: ${horse.condition} out of 100`"
            >
              <div
                class="condition-fill"
                :style="{
                  width: `${horse.condition}%`,
                  backgroundColor: getConditionColor(horse.condition)
                }"
              ></div>
            </div>
          </div>
          <div :id="`horse-${horse.id}-details`" class="sr-only">
            {{ getConditionDescription(horse.condition) }}
            {{ horse.isRacing ? 'Currently racing' : 'Available for racing' }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState } from 'vuex'

export default {
  name: 'HorseList',
  computed: {
    ...mapState(['horses'])
  },
  methods: {
    getConditionColor(condition: number): string {
      if (condition >= 80) return '#28a745'
      if (condition >= 60) return '#ffc107'
      if (condition >= 40) return '#fd7e14'
      return '#dc3545'
    },
    getConditionDescription(condition: number): string {
      if (condition >= 80) return 'Excellent condition, ready for racing'
      if (condition >= 60) return 'Good condition, should perform well'
      if (condition >= 40) return 'Fair condition, may need some rest'
      return 'Poor condition, needs recovery time'
    },
    handleCardKeydown(event: KeyboardEvent): void {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault()
        // Focus on the card for screen readers
        ;(event.target as HTMLElement).focus()
      }
    }
  }
}
</script>

<style scoped>
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

.horse-list {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
}

.horse-list h3 {
  color: #495057;
  margin-bottom: 20px;
  text-align: center;
}

.horses-grid {
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(250px, 1fr));
  gap: 15px;
}

.horse-card {
  background-color: white;
  border-radius: 8px;
  padding: 15px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  border: 2px solid transparent;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  gap: 15px;
}

.horse-card:hover {
  transform: translateY(-2px);
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.15);
}

.horse-card.racing {
  border-color: #007bff;
  background-color: #e3f2fd;
}

.horse-avatar {
  width: 50px;
  height: 50px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 24px;
  border: 3px solid white;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  flex-shrink: 0;
  transform: scaleX(-1);
}

.horse-details {
  flex: 1;
}

.horse-details h4 {
  margin: 0 0 10px 0;
  color: #495057;
  font-size: 16px;
}

.condition-bar {
  display: flex;
  flex-direction: column;
  gap: 5px;
}

.condition-label {
  font-size: 12px;
  color: #6c757d;
  font-weight: 500;
}

.condition-progress {
  width: 100%;
  height: 8px;
  background-color: #e9ecef;
  border-radius: 4px;
  overflow: hidden;
}

.condition-fill {
  height: 100%;
  border-radius: 4px;
  transition: width 0.3s ease;
}

/* Focus styles for accessibility */
.horse-card:focus {
  outline: 3px solid #4a90e2;
  outline-offset: 2px;
  box-shadow: 0 0 0 3px rgba(74, 144, 226, 0.3);
}

/* High contrast mode support */
:global(body.high-contrast) .horse-list {
  background-color: #000000;
  color: #ffffff;
  border: 2px solid #ffffff;
}

:global(body.high-contrast) .horse-list h3 {
  color: #ffffff !important;
}

:global(body.high-contrast) .horse-card {
  background-color: #000000;
  color: #ffffff !important;
  border: 2px solid #ffffff;
}

:global(body.high-contrast) .horse-details h4 {
  color: #ffffff !important;
}

:global(body.high-contrast) .condition-label {
  color: #ffffff !important;
}

:global(body.high-contrast) .horse-card:focus {
  outline: 4px solid #ffff00;
  outline-offset: 2px;
  box-shadow: 0 0 0 4px rgba(255, 255, 0, 0.8);
}

:global(body.high-contrast) .horse-card.racing {
  border-color: #00ffff;
  background-color: #000080;
}

:global(body.high-contrast) .condition-progress {
  background-color: #808080;
  border: 1px solid #ffffff;
}

/* Reduced motion support */
@media (prefers-reduced-motion: reduce) {
  .horse-card {
    transition: none;
  }

  .condition-fill {
    transition: none;
  }
}
</style>
