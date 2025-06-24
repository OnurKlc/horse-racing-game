<template>
  <div v-if="show" class="confetti-container" @animationend="onAnimationEnd">
    <div
      v-for="(particle, index) in particles"
      :key="index"
      class="confetti-particle"
      :style="{
        left: `${particle.x}%`,
        backgroundColor: particle.color,
        animationDelay: `${particle.delay}ms`,
        animationDuration: `${particle.duration}ms`
      }"
    ></div>
  </div>
</template>

<script lang="ts">
export interface Particle {
  x: number
  color: string
  delay: number
  duration: number
}

export default {
  name: 'ConfettiEffect',
  props: {
    trigger: {
      type: Boolean,
      default: false
    },
    colors: {
      type: Array as () => string[],
      default: () => ['#FFD700', '#FF6B6B', '#4ECDC4', '#45B7D1', '#FFA07A', '#98D8C8']
    }
  },
  emits: ['finished'],
  data() {
    return {
      show: false,
      particles: [] as Particle[]
    }
  },
  watch: {
    trigger(newVal: boolean) {
      if (newVal) {
        this.showConfetti()
      }
    }
  },
  methods: {
    showConfetti(): void {
      this.particles = this.generateParticles()
      this.show = true
    },
    generateParticles(): Particle[] {
      const particles: Particle[] = []
      const particleCount = 50

      for (let i = 0; i < particleCount; i++) {
        particles.push({
          x: Math.random() * 100,
          color: this.colors[Math.floor(Math.random() * this.colors.length)],
          delay: Math.random() * 500,
          duration: 2000 + Math.random() * 1000
        })
      }

      return particles
    },
    onAnimationEnd(): void {
      this.show = false
      this.$emit('finished')
    }
  }
}
</script>

<style scoped>
.confetti-container {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  pointer-events: none;
  overflow: hidden;
  z-index: 1000;
}

.confetti-particle {
  position: absolute;
  width: 8px;
  height: 8px;
  top: -10px;
  border-radius: 2px;
  animation: confetti-fall linear forwards;
}

@keyframes confetti-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg);
    opacity: 1;
  }
  100% {
    transform: translateY(100vh) rotate(720deg);
    opacity: 0;
  }
}

/* Add some variation to the confetti */
.confetti-particle:nth-child(2n) {
  width: 6px;
  height: 12px;
  border-radius: 0;
}

.confetti-particle:nth-child(3n) {
  width: 10px;
  height: 6px;
  border-radius: 50%;
}

.confetti-particle:nth-child(4n) {
  animation-name: confetti-spin-fall;
}

@keyframes confetti-spin-fall {
  0% {
    transform: translateY(-100vh) rotate(0deg) scale(1);
    opacity: 1;
  }
  50% {
    transform: translateY(50vh) rotate(360deg) scale(0.8);
    opacity: 0.8;
  }
  100% {
    transform: translateY(100vh) rotate(720deg) scale(0.2);
    opacity: 0;
  }
}
</style>
