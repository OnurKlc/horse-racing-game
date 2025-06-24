<template>
  <div v-if="raceResults.length > 0" class="results">
    <h3>Race Results</h3>

    <div class="results-container">
      <div v-for="(result, index) in raceResults" :key="index" class="race-result">
        <h4>Round {{ result.round }} - {{ result.distance }}m</h4>

        <div class="podium">
          <div class="podium-places">
            <div
              v-for="(place, idx) in result.results.slice(0, 3)"
              :key="idx"
              class="podium-place"
              :class="`place-${place.position}`"
            >
              <div class="medal">{{ place.position }}</div>
              <div class="horse-circle" :style="{ backgroundColor: place.horse.color }">🐎</div>
              <div class="place-info">
                <div class="horse-name">{{ place.horse.name }}</div>
                <div class="horse-stats">
                  <span>Condition: {{ place.horse.condition }}</span>
                  <span>Time: {{ place.time }}s</span>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div class="full-results">
          <table class="results-table">
            <thead>
              <tr>
                <th>Position</th>
                <th>Horse</th>
                <th>Condition</th>
                <th>Time</th>
              </tr>
            </thead>
            <tbody>
              <tr
                v-for="place in result.results"
                :key="place.horse.id"
                :class="{ 'top-three': place.position <= 3 }"
              >
                <td class="position">
                  <span class="position-badge" :class="`position-${place.position}`">
                    {{ place.position }}
                  </span>
                </td>
                <td class="horse-cell">
                  <div
                    class="color-indicator"
                    :style="{ backgroundColor: place.horse.color }"
                  ></div>
                  {{ place.horse.name }}
                </td>
                <td>{{ place.horse.condition }}</td>
                <td>{{ place.time }}s</td>
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
</style>
