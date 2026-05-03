import type { RaceResult, TrendType, StatusLabel, DriverPerformanceSummary, TeammateComparison } from "@/types/f1"

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
    totalPoints: results.reduce((s, r) => s + r.points, 0),
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
  if (avgLast5 <= 3) return "Top 3"
  if (avgLast5 <= 5) return "Top 5"
  if (avgLast5 <= 10) return "Top 10"
  return "Fuera del Top 10"
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
