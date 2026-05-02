import { NextRequest, NextResponse } from "next/server"
import { getDriverStandings } from "@/lib/jolpica"

export async function GET(request: NextRequest) {
  const year = parseInt(request.nextUrl.searchParams.get("year") ?? "2025")

  const standings = await getDriverStandings(year)

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
