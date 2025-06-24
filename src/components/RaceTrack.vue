<template>
  <div class="race-track">
    <h3>Round {{ currentRound + 1 }} - {{ currentRaceData?.distance }}m</h3>

    <div class="track-container">
      <div class="track-header">
        <div class="start-line">START</div>
        <div class="finish-line">FINISH</div>
      </div>

      <div class="lanes">
        <div v-for="(horse, index) in currentRaceHorses" :key="horse.id" class="lane">
          <div class="lane-number">{{ index + 1 }}</div>
          <div class="track-surface">
            <div
              class="horse"
              :style="{
                left: `${(horse.position / currentRaceData.distance) * 100}%`
              }"
            >
              <div class="horse-circle" :style="{ backgroundColor: horse.color }">🐎</div>
            </div>
          </div>
          <div class="horse-info" :class="getFinishPosition(horse)">
            <span class="horse-name">{{ horse.name }}</span>
            <span class="horse-condition">{{ horse.condition }}</span>
          </div>
        </div>
      </div>

      <div class="progress-info">
        <div class="distance-markers">
          <div class="marker" style="left: 0%">0m</div>
          <div class="marker" style="left: 25%">
            {{ Math.round(currentRaceData.distance * 0.25) }}m
          </div>
          <div class="marker" style="left: 50%">
            {{ Math.round(currentRaceData.distance * 0.5) }}m
          </div>
          <div class="marker" style="left: 75%">
            {{ Math.round(currentRaceData.distance * 0.75) }}m
          </div>
          <div class="marker" style="left: 100%">{{ currentRaceData.distance }}m</div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { mapState, mapGetters } from 'vuex'
import type { Horse } from '@/types'

export default {
  name: 'RaceTrack',
  computed: {
    ...mapState(['currentRaceHorses', 'currentRound']),
    ...mapGetters(['currentRaceData']),
    finishedHorses() {
      return (this as any).currentRaceHorses
        .filter(
          (horse: Horse) =>
            horse.position >= (this as any).currentRaceData.distance && horse.raceTime !== null
        )
        .sort((a: Horse, b: Horse) => (a.raceTime || 0) - (b.raceTime || 0))
    }
  },
  methods: {
    getFinishPosition(horse: Horse): string {
      if (horse.position < (this as any).currentRaceData.distance) {
        return ''
      }

      const finishIndex = (this as any).finishedHorses.findIndex((h: Horse) => h.id === horse.id)
      if (finishIndex === 0) return 'first-place'
      if (finishIndex === 1) return 'second-place'
      if (finishIndex === 2) return 'third-place'
      return 'finished'
    }
  }
}
</script>

<style scoped>
.race-track {
  background-color: #f8f9fa;
  padding: 20px;
  border-radius: 10px;
  margin-bottom: 20px;
}

.race-track h3 {
  text-align: center;
  margin-bottom: 20px;
  color: #495057;
}

.track-container {
  position: relative;
  background: linear-gradient(to right, #8fbc8f, #90ee90);
  border-radius: 10px;
  padding: 20px 10px;
  min-height: 600px;
}

.track-header {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
  font-weight: bold;
  color: #495057;
}

.start-line,
.finish-line {
  background-color: white;
  padding: 5px 10px;
  border-radius: 5px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.lanes {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.lane {
  display: flex;
  align-items: center;
  height: 50px;
  background-color: rgba(255, 255, 255, 0.3);
  border-radius: 25px;
  position: relative;
  border: 2px solid rgba(255, 255, 255, 0.5);
}

.lane-number {
  min-width: 30px;
  text-align: center;
  font-weight: bold;
  color: #495057;
  background-color: white;
  border-radius: 50%;
  width: 30px;
  height: 30px;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-left: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
}

.track-surface {
  flex: 1;
  position: relative;
  height: 100%;
  margin: 0 10px;
  background: linear-gradient(to right, rgba(139, 69, 19, 0.3) 0%, rgba(160, 82, 45, 0.3) 100%);
  border-radius: 20px;
  overflow: hidden;
}

.horse {
  position: absolute;
  top: 50%;
  transform: translateY(-50%);
  transition: left 0.1s ease-out;
  z-index: 10;
}

.horse-circle {
  width: 40px;
  height: 40px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 20px;
  border: 3px solid white;
  box-shadow: 0 4px 8px rgba(0, 0, 0, 0.3);
  transform: scaleX(-1);
}

.horse-info {
  min-width: 120px;
  display: flex;
  flex-direction: column;
  align-items: center;
  font-size: 12px;
  color: #495057;
  background-color: white;
  padding: 5px;
  border-radius: 5px;
  margin-right: 10px;
  box-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
  transition: all 0.3s ease;
}

.horse-info.first-place {
  background: linear-gradient(135deg, #ffd700, #ffed4e);
  border: 2px solid #ffd700;
  color: #8b6914;
  box-shadow: 0 4px 8px rgba(255, 215, 0, 0.4);
}

.horse-info.second-place {
  background: linear-gradient(135deg, #c0c0c0, #e8e8e8);
  border: 2px solid #c0c0c0;
  color: #666;
  box-shadow: 0 4px 8px rgba(192, 192, 192, 0.4);
}

.horse-info.third-place {
  background: linear-gradient(135deg, #cd7f32, #daa520);
  border: 2px solid #cd7f32;
  color: #8b4513;
  box-shadow: 0 4px 8px rgba(205, 127, 50, 0.4);
}

.horse-info.finished {
  background-color: #d4edda;
  border: 2px solid #28a745;
  color: #155724;
  box-shadow: 0 4px 8px rgba(40, 167, 69, 0.3);
}

.horse-name {
  font-weight: bold;
}

.horse-condition {
  color: #6c757d;
}

.horse-info.first-place .horse-condition {
  color: #8b6914;
}

.horse-info.second-place .horse-condition {
  color: #666;
}

.horse-info.third-place .horse-condition {
  color: #8b4513;
}

.horse-info.finished .horse-condition {
  color: #155724;
}

.progress-info {
  margin-top: 15px;
}

.distance-markers {
  position: relative;
  height: 20px;
  background-color: rgba(255, 255, 255, 0.5);
  border-radius: 10px;
}

.marker {
  position: absolute;
  top: -25px;
  transform: translateX(-50%);
  font-size: 12px;
  color: #495057;
  font-weight: bold;
  background-color: white;
  padding: 2px 6px;
  border-radius: 3px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
</style>
