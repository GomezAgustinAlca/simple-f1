export interface Driver {
  id: string
  givenName: string
  familyName: string
  code?: string
  nationality?: string
  permanentNumber?: string
  currentTeam?: string
}

export interface RaceResult {
  season: number
  round: number
  raceName: string
  date: string
  circuitId: string
  circuitName: string
  driverId: string
  constructorId: string
  constructorName: string
  grid?: number
  position?: number
  positionText?: string
  status: string
  points: number
}

export type TrendType = "UP" | "DOWN" | "STABLE" | "UNSTABLE" | "INSUFFICIENT_DATA"
export type StatusLabel =
  | "En mejora"
  | "Estable"
  | "Inestable"
  | "En caída"
  | "Sin datos suficientes"

export interface DriverPerformanceSummary {
  driverId: string
  season: number
  racesCount: number
  lastFiveAveragePosition: number | null
  seasonAveragePosition: number | null
  totalPoints: number
  dnfs: number
  bestFinish: number | null
  worstFinish: number | null
  trend: TrendType
  statusLabel: StatusLabel
  summaryText: string
}

export interface TeammateComparison {
  teammateId: string
  teammateName: string
  racesAhead: number
  racesBehind: number
  avgPositionDiff: number
  summaryText: string
}

export interface DriverStanding {
  position: number
  points: number
  wins: number
  driverId: string
  givenName: string
  familyName: string
  nationality?: string
  constructorName: string
}

export interface DriverWithSummary {
  driver: Driver
  summary: DriverPerformanceSummary
}
