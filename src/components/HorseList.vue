<template>
  <div class="horse-list">
    <h3>Available Horses ({{ horses.length }})</h3>

    <div class="horses-grid">
      <div
        v-for="horse in horses"
        :key="horse.id"
        class="horse-card"
        :class="{ racing: horse.isRacing }"
      >
        <div class="horse-avatar" :style="{ backgroundColor: horse.color }">🐎</div>

        <div class="horse-details">
          <h4>{{ horse.name }}</h4>
          <div class="condition-bar">
            <div class="condition-label">Condition: {{ horse.condition }}/100</div>
            <div class="condition-progress">
              <div
                class="condition-fill"
                :style="{
                  width: `${horse.condition}%`,
                  backgroundColor: getConditionColor(horse.condition)
                }"
              ></div>
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
  name: 'HorseList',
  computed: {
    ...mapState(['horses'])
  },
  methods: {
    getConditionColor(condition) {
      if (condition >= 80) return '#28a745'
      if (condition >= 60) return '#ffc107'
      if (condition >= 40) return '#fd7e14'
      return '#dc3545'
    }
  }
}
</script>

<style scoped>
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
</style>
