export interface Horse {
  id: number
  name: string
  color: string
  condition: number
  position: number
  isRacing: boolean
  raceTime?: number | null
  finished?: boolean
}

export interface RaceRound {
  round: number
  distance: number
  horses: Horse[]
  results: RaceResult[] | null
  completed: boolean
}

export interface RaceResult {
  position: number
  horse: Horse
  time: string
}

export interface CompletedRaceResult {
  round: number
  distance: number
  results: RaceResult[]
}

export interface RootState {
  horses: Horse[]
  raceSchedule: RaceRound[]
  currentRound: number
  isRacing: boolean
  isPaused: boolean
  isWaitingBetweenRounds: boolean
  raceCompleted: boolean
  raceResults: CompletedRaceResult[]
  currentRaceHorses: Horse[]
}

export interface RaceActions {
  generateRaceSchedule(): Promise<void>
  startRace(): Promise<void>
  runSingleRace(params: { round: number; distance: number }): Promise<void>
  pauseRace(): void
}

export interface RaceGetters {
  currentRaceData: RaceRound | null
}
