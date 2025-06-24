<template>
  <div v-if="hasSchedule" class="race-schedule">
    <h3>Race Schedule</h3>
    <div class="schedule-grid">
      <div
        v-for="(race, index) in raceSchedule"
        :key="index"
        class="race-item"
        :class="{ completed: race.completed }"
      >
        <h4>Round {{ race.round }}</h4>
        <p>{{ race.distance }}m</p>
        <p>{{ race.horses.length }} horses</p>

        <div v-if="race.horses.length > 0" class="horses-list">
          <div class="horses-grid">
            <div v-for="horse in getSortedHorses(race.horses)" :key="horse.id" class="horse-item">
              <div class="horse-indicator" :style="{ backgroundColor: horse.color }">🐎</div>
              <span class="horse-name">{{ horse.name }}</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { mapState } from 'vuex'

export default {
  name: 'RaceSchedule',
  computed: {
    ...mapState(['raceSchedule']),
    hasSchedule() {
      return this.raceSchedule.length > 0
    }
  },
  methods: {
    getSortedHorses(horses) {
      return [...horses].sort((a, b) => a.id - b.id)
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
</style>
