import type { RaceResult, TrendType, StatusLabel, DriverPerformanceSummary, TeammateComparison } from "@/types/f1"
import { getCircuitDisplayName } from "@/lib/circuits"

export function isDNF(status: string): boolean {
  if (!status) return false
  if (status === "Finished") return false
  if (status.startsWith("+")) return false
  return true
}

function avg(nums: number[]): number {
  if (nums.length === 0) return 0
  return nums.reduce((a, b) => a + b, 0) / nums.length
}

export function calculateTrend(results: RaceResult[]): TrendType {
  const valid = results
    .filter((r) => !isDNF(r.status) && r.position != null)
    .slice(-5)

  if (valid.length < 3) return "INSUFFICIENT_DATA"

  const last3 = valid.slice(-3)
  const prev3 = valid.slice(-6, -3)

  const avgLast3 = avg(last3.map((r) => r.position!))
  const avgPrev3 = prev3.length >= 2 ? avg(prev3.map((r) => r.position!)) : null

  if (avgPrev3 !== null) {
    if (avgPrev3 - avgLast3 >= 2) return "UP"
    if (avgLast3 - avgPrev3 >= 2) return "DOWN"
  }

  const positions = valid.map((r) => r.position!)
  const spread = Math.max(...positions) - Math.min(...positions)
  if (spread >= 8) return "UNSTABLE"

  return "STABLE"
}

export function trendToStatusLabel(trend: TrendType, dnfs: number, racesCount: number): StatusLabel {
  const dnfRate = racesCount > 0 ? dnfs / racesCount : 0
  switch (trend) {
    case "UP":
      return dnfRate < 0.3 ? "En mejora" : "Inestable"
    case "DOWN":
      return "En caída"
    case "UNSTABLE":
      return "Inestable"
    case "STABLE":
      return "Estable"
    case "INSUFFICIENT_DATA":
      return "Sin datos suficientes"
  }
}

export function buildPerformanceSummary(
  driverId: string,
  season: number,
  results: RaceResult[]
): DriverPerformanceSummary {
  const finished = results.filter((r) => !isDNF(r.status) && r.position != null)
  const lastFive = finished.slice(-5)
  const dnfs = results.filter((r) => isDNF(r.status)).length
  const positions = finished.map((r) => r.position!)
  const trend = calculateTrend(results)
  const statusLabel = trendToStatusLabel(trend, dnfs, results.length)

  return {
    driverId,
    season,
    racesCount: results.length,
    lastFiveAveragePosition: lastFive.length > 0 ? avg(lastFive.map((r) => r.position!)) : null,
    seasonAveragePosition: finished.length > 0 ? avg(positions) : null,
    totalPoints: 0, // set by caller from driverStandings — never calculated from results
    dnfs,
    bestFinish: positions.length > 0 ? Math.min(...positions) : null,
    worstFinish: positions.length > 0 ? Math.max(...positions) : null,
    trend,
    statusLabel,
    summaryText: "",
  }
}

export function interpretRecentPerformance(summary: DriverPerformanceSummary): string {
  if (summary.lastFiveAveragePosition == null) return "Sin datos"
  if (summary.racesCount - summary.dnfs < 3) return "Muestra limitada"
  const avg = summary.lastFiveAveragePosition
  if (avg <= 3) return "Top 3"
  if (avg <= 5) return "Top 5"
  if (avg <= 10) return "Top 10"
  return "Fuera del Top 10"
}

export function getPerformanceLevel(avgSeason: number | null): string {
  if (avgSeason == null) return "Incierto"
  if (avgSeason <= 3) return "Alto"
  if (avgSeason <= 6) return "Medio"
  return "Bajo"
}

export function getTrend(lastResults: RaceResult[]): string {
  const trend = calculateTrend(lastResults)
  switch (trend) {
    case "UP": return "Mejora"
    case "DOWN": return "Empeora"
    case "STABLE": return "Estable"
    case "UNSTABLE": return "Estable"
    case "INSUFFICIENT_DATA": return "Sin datos"
  }
}

export function getRecentPerformance(avgLast5: number | null, racesCount: number): string {
  if (racesCount < 3 || avgLast5 == null) return "Muestra limitada"
  return avgPositionToLabel(avgLast5)
}

export function avgPositionToLabel(avg: number): string {
  if (avg <= 3) return "Top 3"
  if (avg <= 5) return "Top 5"
  if (avg <= 10) return "Top 10"
  return "fuera del Top 10"
}

export function getCompareWinner(
  summaryA: DriverPerformanceSummary,
  summaryB: DriverPerformanceSummary
): "A" | "B" | null {
  const avgA = summaryA.seasonAveragePosition ?? 99
  const avgB = summaryB.seasonAveragePosition ?? 99
  const recentA = summaryA.lastFiveAveragePosition ?? 99
  const recentB = summaryB.lastFiveAveragePosition ?? 99
  const levelPoints = avgA < avgB ? 1 : avgA > avgB ? -1 : 0
  const recentPoints = recentA < recentB ? 1 : recentA > recentB ? -1 : 0
  const total = levelPoints + recentPoints
  if (total > 0) return "A"
  if (total < 0) return "B"
  return null
}

const SLOW_CIRCUIT_KEYWORDS = ["monaco", "singapore", "hungary", "baku", "zandvoort", "abu dhabi", "mexico", "melbourne"]

export function getConsistency(results: RaceResult[]): { label: string; explanation: string; premiumExplanation: string } {
  const finished = results.filter((r) => !isDNF(r.status) && r.position != null)
  if (finished.length < 3) return { label: "Sin datos", explanation: "Muestra insuficiente para calcular consistencia.", premiumExplanation: "Muestra insuficiente para calcular consistencia." }
  const positions = finished.map((r) => r.position!)
  const spread = Math.max(...positions) - Math.min(...positions)
  const avgPos = avg(positions)
  if (spread <= 3) {
    let premiumExplanation: string
    if (avgPos <= 5) premiumExplanation = "Regularidad de alto nivel: mantiene resultados sin caídas en la zona que importa."
    else if (avgPos <= 10) premiumExplanation = "Alta consistencia, pero sin resultados altos. Predecible, no dominante."
    else premiumExplanation = "Regular en posiciones bajas: la consistencia aquí no suma al campeonato."
    return { label: "Alta", explanation: "Los resultados son muy regulares entre carreras.", premiumExplanation }
  }
  if (spread <= 7) return { label: "Media", explanation: "Hay variación moderada en los resultados.", premiumExplanation: "Variación moderada: puede subir, pero también caer. Sin un piso claro de rendimiento." }
  return { label: "Baja", explanation: "Los resultados varían mucho de carrera a carrera.", premiumExplanation: "Alta irregularidad: cada carrera es impredecible. Falta de base para proyectar su rendimiento." }
}

export function getCircuitTypePerformance(results: RaceResult[]): { label: string; explanation: string; premiumExplanation: string } {
  const finished = results.filter((r) => !isDNF(r.status) && r.position != null)
  const slow = finished.filter((r) =>
    SLOW_CIRCUIT_KEYWORDS.some((kw) => r.circuitName.toLowerCase().includes(kw))
  )
  const fast = finished.filter((r) =>
    !SLOW_CIRCUIT_KEYWORDS.some((kw) => r.circuitName.toLowerCase().includes(kw))
  )
  if (slow.length === 0 && fast.length === 0) return { label: "Sin datos", explanation: "No hay carreras para comparar.", premiumExplanation: "No hay carreras para comparar." }
  if (slow.length === 0) return { label: "Solo rápidos", explanation: "Aún no compitió en circuitos lentos esta temporada.", premiumExplanation: "Aún no compitió en circuitos lentos esta temporada." }
  if (fast.length === 0) return { label: "Solo lentos", explanation: "Aún no compitió en circuitos rápidos esta temporada.", premiumExplanation: "Aún no compitió en circuitos rápidos esta temporada." }
  const avgSlow = slow.reduce((s, r) => s + r.position!, 0) / slow.length
  const avgFast = fast.reduce((s, r) => s + r.position!, 0) / fast.length
  const diff = avgFast - avgSlow
  if (diff > 2) return {
    label: "Mejor en lentos",
    explanation: `Promedia P${Math.round(avgSlow)} en circuitos lentos y P${Math.round(avgFast)} en rápidos.`,
    premiumExplanation: `Aprovecha circuitos donde el auto importa menos. P${Math.round(avgSlow)} en lentos vs P${Math.round(avgFast)} en rápidos — terreno favorable para él.`,
  }
  if (diff < -2) return {
    label: "Mejor en rápidos",
    explanation: `Promedia P${Math.round(avgFast)} en circuitos rápidos y P${Math.round(avgSlow)} en lentos.`,
    premiumExplanation: `Rinde en circuitos que exigen más. P${Math.round(avgFast)} en rápidos vs P${Math.round(avgSlow)} en lentos — donde la diferencia entre pilotos se amplifica.`,
  }
  return {
    label: "Equilibrado",
    explanation: "Rinde de forma similar en ambos tipos de circuito.",
    premiumExplanation: "Sin ventaja diferencial por tipo de circuito. No destaca en ningún terreno específico.",
  }
}

export function getGridPositionImpact(results: RaceResult[]): { label: string; explanation: string; premiumExplanation: string } {
  const valid = results.filter(
    (r) => !isDNF(r.status) && r.position != null && r.grid != null && r.grid > 0
  )
  if (valid.length < 2) return { label: "Sin datos", explanation: "Muestra insuficiente.", premiumExplanation: "Muestra insuficiente." }
  const gains = valid.map((r) => r.grid! - r.position!)
  const avgGain = gains.reduce((s, n) => s + n, 0) / gains.length
  const rounded = Math.abs(avgGain).toFixed(1)
  if (avgGain > 1) return {
    label: "Gana posiciones",
    explanation: `Mejora en promedio ${rounded} posición(es) respecto a la salida.`,
    premiumExplanation: `Adelanta ${rounded} posición(es) en promedio: ritmo real en carrera más allá de donde clasifica.`,
  }
  if (avgGain < -1) return {
    label: "Pierde posiciones",
    explanation: `Pierde en promedio ${rounded} posición(es) respecto a la salida.`,
    premiumExplanation: `Retrocede ${rounded} posición(es) desde la salida. Su resultado de carrera es peor que su clasificación — déficit de ritmo o estrategia.`,
  }
  return {
    label: "Mantiene posición",
    explanation: "Suele terminar cerca de donde sale en parrilla.",
    premiumExplanation: "No logra mejorar posiciones en carrera. Su resultado final depende casi exclusivamente de la clasificación.",
  }
}

export interface CircuitPerformanceResult {
  best: string[]
  worst: string[]
  hasEnoughData: boolean
  usedHistorical: boolean
}

function computeCircuitQualified(results: RaceResult[]) {
  const finished = results.filter((r) => !isDNF(r.status) && r.position != null)
  const byCircuit: Record<string, { total: number; count: number; name: string }> = {}
  for (const r of finished) {
    const key = r.circuitId || r.circuitName
    const name = getCircuitDisplayName(r.circuitId, r.circuitName)
    if (!byCircuit[key]) byCircuit[key] = { total: 0, count: 0, name }
    byCircuit[key].total += r.position!
    byCircuit[key].count++
  }
  return Object.values(byCircuit)
    .filter((v) => v.count >= 2)
    .map((v) => ({ name: v.name, avg: v.total / v.count }))
    .sort((a, b) => a.avg - b.avg)
}

function buildCircuitResult(
  qualified: { name: string; avg: number }[],
  usedHistorical: boolean
): CircuitPerformanceResult {
  const take = Math.min(2, qualified.length)
  return {
    best: qualified.slice(0, take).map((c) => c.name),
    worst: qualified.slice(-take).map((c) => c.name).reverse(),
    hasEnoughData: true,
    usedHistorical,
  }
}

export function getCircuitPerformance(
  currentResults: RaceResult[],
  historicalResults: RaceResult[] = []
): CircuitPerformanceResult {
  const currentQualified = computeCircuitQualified(currentResults)
  if (currentQualified.length > 0) {
    return buildCircuitResult(currentQualified, false)
  }

  if (historicalResults.length === 0) {
    return { best: [], worst: [], hasEnoughData: false, usedHistorical: false }
  }

  const combinedQualified = computeCircuitQualified([...currentResults, ...historicalResults])
  if (combinedQualified.length === 0) {
    return { best: [], worst: [], hasEnoughData: false, usedHistorical: true }
  }

  return buildCircuitResult(combinedQualified, true)
}

export interface CircuitRaceDetail {
  gpName: string
  year: number
  posA: number
  posB: number
}

export interface CircuitAdvantage {
  circuit: string
  winner: string
  posA: number
  posB: number
  races: CircuitRaceDetail[]
}

export function getCircuitAdvantage(
  currentA: RaceResult[],
  currentB: RaceResult[],
  nameA: string,
  nameB: string,
  historicalA: RaceResult[] = [],
  historicalB: RaceResult[] = []
): { advantages: CircuitAdvantage[]; usedHistorical: boolean } {
  const mergedA = [...currentA, ...historicalA]
  const mergedB = [...currentB, ...historicalB]

  const avgByCircuit = (races: RaceResult[]) => {
    const finished = races.filter((r) => !isDNF(r.status) && r.position != null)
    const map: Record<string, { total: number; count: number; displayName: string; raceDetails: Array<{ gpName: string; year: number; pos: number }> }> = {}
    for (const r of finished) {
      const key = r.circuitId || r.circuitName
      const displayName = getCircuitDisplayName(r.circuitId, r.circuitName)
      if (!map[key]) map[key] = { total: 0, count: 0, displayName, raceDetails: [] }
      map[key].total += r.position!
      map[key].count++
      map[key].raceDetails.push({ gpName: r.raceName, year: r.season, pos: r.position! })
    }
    return map
  }

  const mapA = avgByCircuit(mergedA)
  const mapB = avgByCircuit(mergedB)

  const advantages: CircuitAdvantage[] = []
  for (const [key, a] of Object.entries(mapA)) {
    const b = mapB[key]
    if (!b) continue
    const avgA = a.total / a.count
    const avgB = b.total / b.count
    if (Math.abs(avgA - avgB) < 1) continue

    const detailsByYear: Record<number, CircuitRaceDetail> = {}
    for (const ra of a.raceDetails) {
      detailsByYear[ra.year] = { gpName: ra.gpName, year: ra.year, posA: ra.pos, posB: 0 }
    }
    for (const rb of b.raceDetails) {
      if (detailsByYear[rb.year]) detailsByYear[rb.year].posB = rb.pos
    }
    const races = Object.values(detailsByYear)
      .filter((r) => r.posB > 0)
      .sort((x, y) => y.year - x.year)

    advantages.push({
      circuit: a.displayName,
      winner: avgA < avgB ? nameA : nameB,
      posA: Math.round(avgA),
      posB: Math.round(avgB),
      races,
    })
  }

  const usedHistorical = historicalA.length > 0 || historicalB.length > 0
  return { advantages, usedHistorical }
}

export function buildTeammateComparison(
  driverId: string,
  results: RaceResult[],
  allResults: RaceResult[]
): TeammateComparison | null {
  const driverRaces = results.filter((r) => r.position != null)
  if (driverRaces.length === 0) return null

  const teammateCounts: Record<string, number> = {}
  for (const r of driverRaces) {
    const teammates = allResults.filter(
      (x) =>
        x.round === r.round &&
        x.constructorId === r.constructorId &&
        x.driverId !== driverId
    )
    for (const t of teammates) {
      teammateCounts[t.driverId] = (teammateCounts[t.driverId] ?? 0) + 1
    }
  }

  const [teammateId] = Object.entries(teammateCounts).sort((a, b) => b[1] - a[1])[0] ?? []
  if (!teammateId) return null

  const teammateResults = allResults.filter(
    (r) => r.driverId === teammateId && r.position != null
  )
  const teammateInfo = allResults.find((r) => r.driverId === teammateId)

  let racesAhead = 0
  let racesBehind = 0
  const diffs: number[] = []

  for (const dr of driverRaces) {
    const tr = teammateResults.find((r) => r.round === dr.round)
    if (!tr) continue
    const diff = tr.position! - dr.position!
    diffs.push(diff)
    if (diff > 0) racesAhead++
    else if (diff < 0) racesBehind++
  }

  const avgDiff = diffs.length > 0 ? avg(diffs) : 0
  let summaryText = "Está parejo con su compañero."
  if (avgDiff > 1.5) summaryText = "Está por encima de su compañero en la mayoría de las carreras."
  else if (avgDiff < -1.5) summaryText = "Está por debajo de su compañero en la mayoría de las carreras."

  return {
    teammateId,
    teammateName: teammateInfo?.constructorName ?? teammateId,
    racesAhead,
    racesBehind,
    avgPositionDiff: Math.round(avgDiff * 10) / 10,
    summaryText,
  }
}
