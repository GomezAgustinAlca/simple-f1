import { NextResponse } from "next/server"
import { getDriverStandings, getRaceResults } from "@/lib/jolpica"

const SEASONS = [2020, 2021, 2022, 2023, 2024, 2025]

export async function GET() {
  const seasonData = await Promise.all(
    SEASONS.map(async (season) => {
      const [standings, results] = await Promise.all([
        getDriverStandings(season),
        getRaceResults(season),
      ])
      return { season, standings, results }
    })
  )

  const driverMap = new Map<string, {
    driverName: string
    seasonPositions: Record<number, number>
    totalWins: number
    totalPodiums: number
  }>()

  for (const { season, standings, results } of seasonData) {
    const podiumCounts = new Map<string, number>()
    for (const r of results) {
      if (r.position !== undefined && r.position <= 3) {
        podiumCounts.set(r.driverId, (podiumCounts.get(r.driverId) ?? 0) + 1)
      }
    }

    for (const s of standings) {
      if (!driverMap.has(s.driverId)) {
        driverMap.set(s.driverId, {
          driverName: `${s.givenName} ${s.familyName}`,
          seasonPositions: {},
          totalWins: 0,
          totalPodiums: 0,
        })
      }
      const entry = driverMap.get(s.driverId)!
      entry.seasonPositions[season] = s.position
      entry.totalWins += s.wins
      entry.totalPodiums += podiumCounts.get(s.driverId) ?? 0
    }
  }

  const entries = Array.from(driverMap.entries()).map(([driverId, d]) => ({
    driverId,
    driverName: d.driverName,
    seasonPositions: d.seasonPositions,
    totalWins: d.totalWins,
    totalPodiums: d.totalPodiums,
  }))

  entries.sort((a, b) => b.totalWins - a.totalWins || b.totalPodiums - a.totalPodiums)

  return NextResponse.json(entries)
}
