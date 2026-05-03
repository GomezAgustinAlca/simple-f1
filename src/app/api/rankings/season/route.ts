import { NextRequest, NextResponse } from "next/server"
import { getDriverStandings } from "@/lib/jolpica"

export async function GET(request: NextRequest) {
  const yearParam = request.nextUrl.searchParams.get("year") ?? "current"
  const seasonParam: number | "current" = yearParam === "current" ? "current" : parseInt(yearParam)

  const standings = await getDriverStandings(seasonParam)

  const entries = standings.map((s) => ({
    position: s.position,
    driverId: s.driverId,
    driverName: `${s.givenName} ${s.familyName}`,
    constructorName: s.constructorName,
    points: s.points,
    wins: s.wins,
  }))

  return NextResponse.json(entries)
}
