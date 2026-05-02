import { NextRequest, NextResponse } from "next/server"
import { getDriverResults } from "@/lib/jolpica"
import { buildPerformanceSummary } from "@/lib/performance"
import { enrichSummary } from "@/lib/summaries"

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  const { driverId } = await params
  const season = request.nextUrl.searchParams.get("season") ?? "current"
  const seasonParam = season === "current" ? "current" : parseInt(season)
  const seasonNum = season === "current" ? new Date().getFullYear() : parseInt(season)

  const results = await getDriverResults(seasonParam, driverId)
  const summary = enrichSummary(buildPerformanceSummary(driverId, seasonNum, results))

  return NextResponse.json({ results, summary })
}
