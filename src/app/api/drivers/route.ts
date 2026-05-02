import { NextRequest, NextResponse } from "next/server"
import { getDriverStandings } from "@/lib/jolpica"

export async function GET(request: NextRequest) {
  const season = request.nextUrl.searchParams.get("season") ?? "current"
  const seasonParam = season === "current" ? "current" : parseInt(season)

  const standings = await getDriverStandings(seasonParam)
  return NextResponse.json({ standings })
}
