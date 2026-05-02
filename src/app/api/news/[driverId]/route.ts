import { NextRequest, NextResponse } from "next/server"
import { fetchNewsForDriver } from "@/lib/rss"

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ driverId: string }> }
) {
  const { driverId } = await params
  const news = await fetchNewsForDriver(driverId)
  return NextResponse.json({ news })
}
