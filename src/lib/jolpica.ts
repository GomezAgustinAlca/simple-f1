import type { Driver, RaceResult, DriverStanding } from "@/types/f1"

const BASE = "https://api.jolpi.ca/ergast/f1"

async function fetchJolpica<T>(path: string, revalidate = 3600): Promise<T | null> {
  const url = `${BASE}${path}`
  try {
    const res = await fetch(url, {
      next: { revalidate },
      headers: { Accept: "application/json" },
    })
    if (!res.ok) {
      console.error(`[jolpica] HTTP ${res.status} for ${url}`)
      return null
    }
    return (await res.json()) as T
  } catch (err) {
    console.error(`[jolpica] fetch error for ${url}:`, err)
    return null
  }
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseDrivers(data: any): Driver[] {
  const drivers = data?.MRData?.DriverTable?.Drivers ?? []
  return drivers.map(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    (d: any): Driver => ({
      id: d.driverId,
      givenName: d.givenName,
      familyName: d.familyName,
      code: d.code,
      nationality: d.nationality,
      permanentNumber: d.permanentNumber,
    })
  )
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function parseRaceResults(data: any): RaceResult[] {
  const races = data?.MRData?.RaceTable?.Races ?? []
  const results: RaceResult[] = []

  for (const race of races) {
    const raceResults = race.Results ?? []
    for (const r of raceResults) {
      results.push({
        season: parseInt(race.season),
        round: parseInt(race.round),
        raceName: race.raceName,
        date: race.date,
        circuitName: race.Circuit?.circuitName ?? "",
        driverId: r.Driver?.driverId ?? "",
        constructorId: r.Constructor?.constructorId ?? "",
        constructorName: r.Constructor?.name ?? "",
        grid: r.grid ? parseInt(r.grid) : undefined,
        position: r.position ? parseInt(r.position) : undefined,
        positionText: r.positionText,
        status: r.status ?? "",
        points: parseFloat(r.points ?? "0"),
      })
    }
  }

  return results
}

export async function getDrivers(season: number | "current"): Promise<Driver[]> {
  const revalidate = season === "current" ? 3600 : 86400
  const data = await fetchJolpica(`/${season}/drivers.json?limit=100`, revalidate)
  if (!data) return []
  return parseDrivers(data)
}

export async function getDriverResults(
  season: number | "current",
  driverId: string
): Promise<RaceResult[]> {
  const revalidate = season === "current" ? 3600 : 86400
  const data = await fetchJolpica(
    `/${season}/drivers/${driverId}/results.json?limit=100`,
    revalidate
  )
  if (!data) return []
  return parseRaceResults(data)
}

export async function getRaceResults(season: number | "current"): Promise<RaceResult[]> {
  const revalidate = season === "current" ? 3600 : 86400
  const data = await fetchJolpica(`/${season}/results.json?limit=500`, revalidate)
  if (!data) return []
  return parseRaceResults(data)
}

export async function getDriverStandings(
  season: number | "current"
): Promise<DriverStanding[]> {
  const revalidate = season === "current" ? 3600 : 86400
  const data = await fetchJolpica(`/${season}/driverStandings.json`, revalidate)
  if (!data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lists = (data as any)?.MRData?.StandingsTable?.StandingsLists ?? []
  if (lists.length === 0) return []
  const standings = lists[0].DriverStandings ?? []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return standings.map((s: any): DriverStanding => ({
    position: parseInt(s.position),
    points: parseFloat(s.points),
    wins: parseInt(s.wins ?? "0"),
    driverId: s.Driver?.driverId ?? "",
    givenName: s.Driver?.givenName ?? "",
    familyName: s.Driver?.familyName ?? "",
    nationality: s.Driver?.nationality ?? "",
    constructorName: s.Constructors?.[0]?.name ?? "",
  }))
}

export async function getConstructorStandings(season: number | "current") {
  const revalidate = season === "current" ? 3600 : 86400
  const data = await fetchJolpica(`/${season}/constructorStandings.json`, revalidate)
  if (!data) return []

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const lists = (data as any)?.MRData?.StandingsTable?.StandingsLists ?? []
  if (lists.length === 0) return []
  return lists[0].ConstructorStandings ?? []
}

export async function getCurrentSeasonYear(): Promise<string> {
  // Reuses the same URL as getDriverStandings("current") — Next.js deduplicates the fetch
  const data = await fetchJolpica<unknown>("/current/driverStandings.json", 3600)
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const year = (data as any)?.MRData?.StandingsTable?.season as string | undefined
  return year ?? new Date().getFullYear().toString()
}
