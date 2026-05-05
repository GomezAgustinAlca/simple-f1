import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { getDriverResults, getDriverStandings, getRaceResults, getCurrentSeasonYear } from "@/lib/jolpica"
import { buildPerformanceSummary, buildTeammateComparison, getPerformanceLevel, getTrend, getRecentPerformance } from "@/lib/performance"
import { enrichSummary } from "@/lib/summaries"
import { formatPosition } from "@/lib/format"
import { nationalityFlag } from "@/lib/flags"
import { DriverAvatar } from "@/components/DriverAvatar"
import { RaceEvolutionChart } from "@/components/RaceEvolutionChart"
import { RecentRaceTable } from "@/components/RecentRaceTable"
import { TeammateComparisonCard } from "@/components/TeammateComparisonCard"
import { PremiumBanner } from "@/components/PremiumBanner"
import { DriverCard } from "@/components/DriverCard"
import { DriverPageClient } from "./DriverPageClient"

interface Props {
  params: Promise<{ driverId: string }>
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { driverId } = await params
  if (driverId.includes(".")) return {}
  const standings = await getDriverStandings("current")
  const standing = standings.find((s) => s.driverId === driverId)
  const name = standing
    ? `${standing.givenName} ${standing.familyName}`
    : driverId

  return {
    title: `${name}: rendimiento, resultados y tendencia | Simple F1`,
    description: `Resumen simple de resultados, evolución y comparación de ${name} en Fórmula 1.`,
  }
}

export default async function DriverPage({ params }: Props) {
  const { driverId } = await params

  if (driverId.includes(".")) {
    notFound()
  }

  const [results, standings, allSeasonResults, currentSeasonStr] = await Promise.all([
    getDriverResults("current", driverId),
    getDriverStandings("current"),
    getRaceResults("current"),
    getCurrentSeasonYear(),
  ])
  const seasonNum = parseInt(currentSeasonStr)

  const standing = standings.find((s) => s.driverId === driverId)
  const driverName = standing
    ? `${standing.givenName} ${standing.familyName}`
    : driverId

  const summary = enrichSummary(buildPerformanceSummary(driverId, seasonNum, results))
  const teammate = buildTeammateComparison(driverId, results, allSeasonResults)

  const championshipSummaries = standings.map((s) => {
    const driverRaceResults = allSeasonResults.filter((r) => r.driverId === s.driverId)
    const summary = enrichSummary(buildPerformanceSummary(s.driverId, seasonNum, driverRaceResults))
    return { standing: s, summary }
  })

  // Find teammate name from standings
  if (teammate) {
    const teammateStanding = standings.find((s) => s.driverId === teammate.teammateId)
    if (teammateStanding) {
      teammate.teammateName = `${teammateStanding.givenName} ${teammateStanding.familyName}`
    }
  }

  // Last vs previous race comparison
  const finishedRaces = results.filter((r) => r.position != null)
  const lastRace = finishedRaces[finishedRaces.length - 1]
  const prevRace = finishedRaces[finishedRaces.length - 2]

  if (!standing && results.length === 0) {
    return (
      <div className="max-w-5xl mx-auto px-4 py-16 text-center space-y-3">
        <h1 className="text-2xl font-bold text-gray-900">Piloto no encontrado</h1>
        <p className="text-gray-500">
          No hay datos disponibles para{" "}
          <span className="font-semibold">{driverId}</span> en la temporada actual.
        </p>
        <a href="/" className="inline-block mt-4 text-indigo-600 hover:underline text-sm">
          ← Volver al inicio
        </a>
      </div>
    )
  }

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-10">
      {/* Header */}
      <div className="space-y-1">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            {standing && (
              <DriverAvatar
                givenName={standing.givenName}
                familyName={standing.familyName}
                size="xl"
                className="ring-4 ring-indigo-50"
              />
            )}
            <div>
              <h1 className="text-3xl font-black text-gray-900">{driverName}</h1>
              {standing && (
                <p className="text-gray-500 mt-1">
                  {nationalityFlag(standing.nationality) && (
                    <span className="mr-1">{nationalityFlag(standing.nationality)}</span>
                  )}
                  {standing.constructorName}
                  {standing.position && (
                    <span className="ml-2 text-gray-400">· P{standing.position} campeonato</span>
                  )}
                </p>
              )}
            </div>
          </div>
          {standing?.points != null && (
            <div className="text-right">
              <p className="text-3xl font-black text-indigo-600">{standing.points}</p>
              <p className="text-xs text-gray-400">puntos</p>
            </div>
          )}
        </div>
      </div>

      {/* Summary cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Nivel</p>
          <p className="text-sm font-semibold text-gray-900">
            {getPerformanceLevel(summary.seasonAveragePosition)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Tendencia</p>
          <p className="text-sm font-semibold text-gray-900">
            {getTrend(results)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">Rendimiento reciente</p>
          <p className="text-sm font-semibold text-gray-900">
            {getRecentPerformance(summary.lastFiveAveragePosition, summary.racesCount)}
          </p>
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-2">
          <p className="text-xs text-gray-400 uppercase tracking-wide">DNFs temporada</p>
          <p className="text-2xl font-black text-gray-900">{summary.dnfs}</p>
        </div>
      </div>

      {/* Limited sample notice */}
      {summary.racesCount - summary.dnfs < 2 && (
        <div className="flex items-center gap-3 bg-amber-50 border border-amber-100 rounded-2xl px-5 py-3.5">
          <svg className="w-4 h-4 text-amber-500 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L3.732 16.5c-.77.833.192 2.5 1.732 2.5z" />
          </svg>
          <p className="text-sm font-semibold text-amber-700">
            Muestra limitada — menos de 2 carreras válidas terminadas. Las métricas no son representativas.
          </p>
        </div>
      )}

      {/* Charts — client component handles premium */}
      <DriverPageClient
        results={results}
        summary={summary}
        lastRace={lastRace ?? null}
        prevRace={prevRace ?? null}
        teammate={teammate}
      />

      {championshipSummaries.length > 0 && (
        <section className="space-y-5">
          <h2 className="text-xl font-bold text-gray-900">Campeonato {seasonNum}</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {championshipSummaries.map(({ standing, summary }) => (
              <DriverCard
                key={standing.driverId}
                driverId={standing.driverId}
                givenName={standing.givenName}
                familyName={standing.familyName}
                nationality={standing.nationality}
                team={standing.constructorName}
                statusLabel={summary.statusLabel}
                trend={summary.trend}
                points={standing.points}
                position={standing.position}
              />
            ))}
          </div>
        </section>
      )}

      <PremiumBanner />
    </div>
  )
}
