export interface SoundEffect {
  name: string
  frequency: number
  duration: number
  type: 'sine' | 'square' | 'triangle' | 'sawtooth'
  volume?: number
}

class SoundManager {
  private audioContext: AudioContext | null = null
  private enabled = true

  constructor() {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)()
    } catch {
      // Web Audio API not supported - fail silently
    }
  }

  setEnabled(enabled: boolean): void {
    this.enabled = enabled
  }

  isEnabled(): boolean {
    return this.enabled
  }

  private createBeep(
    frequency: number,
    duration: number,
    type: OscillatorType = 'sine',
    volume = 0.1
  ): void {
    if (!this.audioContext || !this.enabled) return

    try {
      const oscillator = this.audioContext.createOscillator()
      const gainNode = this.audioContext.createGain()

      oscillator.connect(gainNode)
      gainNode.connect(this.audioContext.destination)

      oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime)
      oscillator.type = type

      gainNode.gain.setValueAtTime(0, this.audioContext.currentTime)
      gainNode.gain.linearRampToValueAtTime(volume, this.audioContext.currentTime + 0.01)
      gainNode.gain.exponentialRampToValueAtTime(0.001, this.audioContext.currentTime + duration)

      oscillator.start(this.audioContext.currentTime)
      oscillator.stop(this.audioContext.currentTime + duration)
    } catch {
      // Error playing sound - fail silently
    }
  }

  playSound(effect: SoundEffect): void {
    this.createBeep(effect.frequency, effect.duration, effect.type, effect.volume || 0.1)
  }

  // Predefined sound effects
  playRaceStart(): void {
    this.playSound({
      name: 'raceStart',
      frequency: 800,
      duration: 0.2,
      type: 'square',
      volume: 0.15
    })
    setTimeout(() => {
      this.playSound({
        name: 'raceStart2',
        frequency: 1000,
        duration: 0.3,
        type: 'sine',
        volume: 0.1
      })
    }, 100)
  }

  playHorseFinish(position: number): void {
    const frequencies = [1200, 1000, 800] // Gold, Silver, Bronze
    const frequency = frequencies[position - 1] || 600

    this.playSound({
      name: `finish${position}`,
      frequency,
      duration: 0.4,
      type: 'triangle',
      volume: 0.12
    })
  }

  playRaceComplete(): void {
    // Victory fanfare
    const notes = [523, 659, 784, 1047] // C, E, G, C (major chord)
    notes.forEach((frequency, index) => {
      setTimeout(() => {
        this.playSound({
          name: `victory${index}`,
          frequency,
          duration: 0.6,
          type: 'sine',
          volume: 0.08
        })
      }, index * 150)
    })
  }

  playButtonClick(): void {
    this.playSound({ name: 'click', frequency: 400, duration: 0.1, type: 'square', volume: 0.05 })
  }

  playPause(): void {
    this.playSound({ name: 'pause', frequency: 300, duration: 0.2, type: 'triangle', volume: 0.08 })
  }

  playResume(): void {
    this.playSound({
      name: 'resume',
      frequency: 500,
      duration: 0.2,
      type: 'triangle',
      volume: 0.08
    })
  }
}

export const soundManager = new SoundManager()
