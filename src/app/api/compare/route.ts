import { NextRequest, NextResponse } from "next/server"
import { getDriverResults, getDriverStandings } from "@/lib/jolpica"
import { buildPerformanceSummary } from "@/lib/performance"
import { enrichSummary } from "@/lib/summaries"

export async function GET(request: NextRequest) {
  const { searchParams } = request.nextUrl
  const driverA = searchParams.get("driverA")
  const driverB = searchParams.get("driverB")
  const season = searchParams.get("season") ?? "current"
  const seasonParam = season === "current" ? "current" : parseInt(season)
  const seasonNum = season === "current" ? new Date().getFullYear() : parseInt(season)

  if (!driverA || !driverB) {
    return NextResponse.json({ error: "driverA and driverB required" }, { status: 400 })
  }

  const [resultsA, resultsB, standings] = await Promise.all([
    getDriverResults(seasonParam, driverA),
    getDriverResults(seasonParam, driverB),
    getDriverStandings(seasonParam),
  ])

  const summaryA = enrichSummary(buildPerformanceSummary(driverA, seasonNum, resultsA))
  const summaryB = enrichSummary(buildPerformanceSummary(driverB, seasonNum, resultsB))

  // Use official championship points from standings — same source as rankings/cards
  const standingA = standings.find((s) => s.driverId === driverA)
  const standingB = standings.find((s) => s.driverId === driverB)
  if (standingA) summaryA.totalPoints = standingA.points
  if (standingB) summaryB.totalPoints = standingB.points

  return NextResponse.json({
    driverA: { results: resultsA, summary: summaryA },
    driverB: { results: resultsB, summary: summaryB },
  })
}
