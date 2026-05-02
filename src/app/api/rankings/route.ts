import { NextRequest, NextResponse } from "next/server"
import { getDriverStandings, getDriverResults } from "@/lib/jolpica"
import { buildPerformanceSummary } from "@/lib/performance"
import { enrichSummary } from "@/lib/summaries"

export async function GET(request: NextRequest) {
  const season = request.nextUrl.searchParams.get("season") ?? "current"
  const seasonParam = season === "current" ? "current" : parseInt(season)
  const seasonNum = season === "current" ? new Date().getFullYear() : parseInt(season)

  const standings = await getDriverStandings(seasonParam)
  const topDrivers = standings.slice(0, 20)

  const summaries = await Promise.all(
    topDrivers.map(async (s) => {
      const results = await getDriverResults(seasonParam, s.driverId)
      return enrichSummary(buildPerformanceSummary(s.driverId, seasonNum, results))
    })
  )

  const withStanding = summaries.map((summary, i) => ({
    ...summary,
    standingPosition: topDrivers[i].position,
    driverName: `${topDrivers[i].givenName} ${topDrivers[i].familyName}`,
    constructorName: topDrivers[i].constructorName,
    totalPoints: topDrivers[i].points,
  }))

  const improving = [...withStanding]
    .filter((s) => s.trend === "UP")
    .sort((a, b) => (a.lastFiveAveragePosition ?? 99) - (b.lastFiveAveragePosition ?? 99))

  const consistent = [...withStanding]
    .filter((s) => s.trend === "STABLE")
    .sort(
      (a, b) =>
        (a.seasonAveragePosition ?? 99) - (b.seasonAveragePosition ?? 99)
    )

  const unstable = [...withStanding].filter((s) => s.trend === "UNSTABLE")

  return NextResponse.json({ improving, consistent, unstable, all: withStanding })
}
