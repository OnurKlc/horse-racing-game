<script setup lang="ts">
import GameBoard from './components/GameBoard.vue'
</script>

<template>
  <div id="app">
    <header>
      <h1>🐎 Horse Racing Game</h1>
      <p>Interactive horse racing simulation with 6 rounds</p>
    </header>

    <main>
      <GameBoard />
    </main>
  </div>
</template>

<style scoped>
#app {
  width: 100vw;
  min-height: 100vh;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: #2c3e50;
  margin: 0;
  padding: 0;
}

header {
  background-color: rgba(255, 255, 255, 0.95);
  padding: 20px;
  text-align: center;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  width: 100%;
  box-sizing: border-box;
}

header h1 {
  margin: 0 0 10px 0;
  color: #2c3e50;
  font-size: 2.5em;
  font-weight: bold;
}

header p {
  margin: 0;
  color: #6c757d;
  font-size: 1.1em;
}

main {
  width: 100%;
  padding: 0;
  box-sizing: border-box;
}
</style>
