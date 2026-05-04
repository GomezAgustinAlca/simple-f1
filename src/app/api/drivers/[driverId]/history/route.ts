import { NextRequest, NextResponse } from "next/server"
import { getDriverResults } from "@/lib/jolpica"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  const { driverId } = await params
  const currentYear = new Date().getFullYear()
  const seasons = [currentYear - 1, currentYear - 2, currentYear - 3]

  const resultSets = await Promise.all(
    seasons.map((year) => getDriverResults(year, driverId))
  )

  const results = resultSets.flat()
  return NextResponse.json({ results })
}
