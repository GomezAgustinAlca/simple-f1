import { NextRequest, NextResponse } from "next/server"

const BASE = "https://api.jolpi.ca/ergast/f1"

const INVALID_STATUSES = ["dnf", "dns", "dsq", "disqualified", "retired", "accident", "collision", "mechanical", "engine", "gearbox", "hydraulics", "suspension", "brakes", "electrical", "withdrew"]

function isInvalidStatus(status: string, positionText?: string): boolean {
  if (!positionText || positionText === "R" || positionText === "D" || positionText === "W" || positionText === "N") return true
  const s = status.toLowerCase()
  return INVALID_STATUSES.some(bad => s.includes(bad))
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function fetchCircuitResults(season: number, circuitId: string): Promise<any[]> {
  const url = `${BASE}/${season}/circuits/${circuitId}/results.json?limit=50`
  try {
    const res = await fetch(url, { next: { revalidate: 86400 }, headers: { Accept: "application/json" } })
    if (!res.ok) return []
    const data = await res.json()
    return data?.MRData?.RaceTable?.Races ?? []
  } catch {
    return []
  }
}

interface CircuitStats {
  driverId: string
  seasons: number[]
  results: Array<{ season: number; position: number | null; positionText: string; status: string }>
  bestPosition: number | null
  averagePosition: number | null
  lastPosition: number | null
  lastSeason: number | null
  hasData: boolean
}

async function getDriverCircuitStats(driverId: string, circuitId: string): Promise<CircuitStats> {
  const currentYear = 2026
  const seasonsToTry = [currentYear, currentYear - 1, currentYear - 2, currentYear - 3]

  const results: CircuitStats["results"] = []
  const validSeasons: number[] = []

  for (const season of seasonsToTry) {
    if (validSeasons.length >= 3) break
    const races = await fetchCircuitResults(season, circuitId)
    if (races.length === 0) continue

    const race = races[0]
    const raceResults: unknown[] = race.Results ?? []
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const driverResult = (raceResults as any[]).find((r: any) => r.Driver?.driverId === driverId)
    if (!driverResult) continue

    validSeasons.push(season)
    const positionText: string = driverResult.positionText ?? ""
    const position = driverResult.position ? parseInt(driverResult.position) : null
    const status: string = driverResult.status ?? ""
    const invalid = isInvalidStatus(status, positionText)

    results.push({
      season,
      position: invalid ? null : position,
      positionText,
      status,
    })
  }

  const validPositions = results.filter(r => r.position !== null).map(r => r.position as number)
  const bestPosition = validPositions.length > 0 ? Math.min(...validPositions) : null
  const averagePosition = validPositions.length > 0
    ? Math.round((validPositions.reduce((a, b) => a + b, 0) / validPositions.length) * 10) / 10
    : null

  const lastResult = results[0] ?? null
  const lastPosition = lastResult?.position ?? null
  const lastSeason = lastResult ? validSeasons[0] : null

  return {
    driverId,
    seasons: validSeasons,
    results,
    bestPosition,
    averagePosition,
    lastPosition,
    lastSeason,
    hasData: validPositions.length > 0,
  }
}

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const driverA = searchParams.get("driverA")
  const driverB = searchParams.get("driverB")
  const circuitId = searchParams.get("circuitId")

  if (!driverA || !driverB || !circuitId) {
    return NextResponse.json({ error: "driverA, driverB, and circuitId are required" }, { status: 400 })
  }

  const [statsA, statsB] = await Promise.all([
    getDriverCircuitStats(driverA, circuitId),
    getDriverCircuitStats(driverB, circuitId),
  ])

  return NextResponse.json({ driverA: statsA, driverB: statsB })
}
