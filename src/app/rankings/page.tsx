"use client"

import { useEffect, useState } from "react"
import Link from "next/link"
import { RankingCard } from "@/components/RankingCard"
import { getCircuitPerformance } from "@/lib/performance"
import type { StatusLabel, TrendType, RaceResult, DriverPerformanceSummary } from "@/types/f1"

interface RankingEntry {
  driverId: string
  driverName: string
  constructorName: string
  statusLabel: StatusLabel
  trend: TrendType
  totalPoints: number
  standingPosition: number
  lastFiveAveragePosition: number | null
}

interface RankingsData {
  improving: RankingEntry[]
  consistent: RankingEntry[]
  unstable: RankingEntry[]
  all: RankingEntry[]
}

interface HistoricalEntry {
  driverId: string
  driverName: string
  seasonPositions: Record<number, number>
  totalWins: number
  totalPodiums: number
}

interface SeasonEntry {
  position: number
  driverId: string
  driverName: string
  constructorName: string
  points: number
  wins: number
}

interface DriverDetail {
  results: RaceResult[]
  summary: DriverPerformanceSummary
}

interface DetailState {
  data: DriverDetail | null
  error: boolean
}

function getSeasons(): number[] {
  const currentYear = new Date().getFullYear()
  return Array.from({ length: currentYear - 2019 }, (_, i) => 2020 + i)
}

function conclusionText(summary: DriverPerformanceSummary): string {
  const { trend, dnfs, racesCount, lastFiveAveragePosition, seasonAveragePosition, bestFinish, worstFinish } = summary

  const p = (n: number | null) => (n != null ? `P${Math.round(n)}` : null)
  const seasonAvg = p(seasonAveragePosition)
  const lastFiveAvg = p(lastFiveAveragePosition)
  const best = p(bestFinish)
  const worst = p(worstFinish)
  const dnfPart = dnfs > 0 ? ` y ${dnfs} abandono${dnfs > 1 ? "s" : ""}` : " sin abandonos"

  if (trend === "INSUFFICIENT_DATA") {
    return `Solo ${racesCount} carrera${racesCount === 1 ? "" : "s"} completada${racesCount === 1 ? "" : "s"}, sin tendencia definida aún.`
  }

  if (trend === "UP") {
    if (seasonAvg && lastFiveAvg) {
      const bestPart = best ? ` Mejor resultado: ${best}.` : ""
      return `Mejorando: ${lastFiveAvg} de promedio en las últimas 5 carreras vs ${seasonAvg} de promedio general.${bestPart}`
    }
    return `Resultados en alza en las últimas carreras. Mejor resultado: ${best ?? "—"}.`
  }

  if (trend === "DOWN") {
    if (seasonAvg && lastFiveAvg) {
      return `En caída: promediaba ${seasonAvg} en el año pero bajó a ${lastFiveAvg} en las últimas 5 salidas${dnfPart}.`
    }
    return `Rendimiento en descenso en las últimas carreras${dnfPart}.`
  }

  if (trend === "STABLE") {
    const spread = bestFinish != null && worstFinish != null ? worstFinish - bestFinish : null
    if (spread != null && spread <= 3) {
      return `Alta consistencia: se mueve entre ${best} y ${worst} con muy poca variación${dnfPart}.`
    }
    if (seasonAvg) {
      return `Promedia ${seasonAvg} en la temporada con resultados entre ${best} y ${worst}${dnfPart}.`
    }
    return `Rendimiento estable de carrera en carrera${dnfPart}.`
  }

  if (trend === "UNSTABLE") {
    if (best && worst) {
      return `Alta irregularidad: resultados entre ${best} y ${worst} en la temporada${dnfPart}.`
    }
    return `Resultados muy irregulares de carrera en carrera${dnfPart}.`
  }

  return "Sin datos suficientes para evaluar tendencia."
}

function raceStatus(status: string): { label: string; color: string } {
  if (status === "Finished") return { label: "Terminó", color: "text-green-700 bg-green-50" }
  if (status.startsWith("+")) return { label: "A una vuelta", color: "text-amber-700 bg-amber-50" }
  return { label: "DNF", color: "text-red-600 bg-red-50" }
}

function RankingsSkeleton() {
  return (
    <div className="space-y-3">
      {Array.from({ length: 7 }).map((_, i) => (
        <div key={i} className="flex items-center gap-4 bg-white rounded-2xl border border-gray-100 shadow-sm p-4 animate-pulse">
          <div className="w-8 h-7 bg-gray-200 rounded" />
          <div className="flex-1 space-y-1.5">
            <div className="h-4 bg-gray-200 rounded w-36" />
            <div className="h-3 bg-gray-100 rounded w-24" />
          </div>
          <div className="hidden sm:flex gap-3">
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-16" />
            <div className="h-4 bg-gray-100 rounded w-12" />
          </div>
          <div className="flex flex-col items-end gap-1.5">
            <div className="w-5 h-5 bg-gray-200 rounded" />
            <div className="h-5 bg-gray-100 rounded w-20" />
          </div>
        </div>
      ))}
    </div>
  )
}

function HistoricalSkeleton() {
  return (
    <div className="animate-pulse space-y-4">
      <div className="space-y-2">
        <div className="h-6 bg-gray-200 rounded w-52" />
        <div className="h-4 bg-gray-100 rounded w-80" />
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <div className="h-10 bg-gray-50 border-b border-gray-100" />
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="h-12 border-b border-gray-50 last:border-0 px-4 flex items-center gap-4">
            <div className="h-4 bg-gray-200 rounded w-32" />
            <div className="h-4 bg-gray-100 rounded w-10" />
            <div className="h-4 bg-gray-100 rounded w-10" />
            <div className="h-4 bg-gray-100 rounded w-10" />
          </div>
        ))}
      </div>
    </div>
  )
}

function SeasonSkeleton() {
  return (
    <div className="animate-pulse overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
      <div className="h-10 bg-gray-50 border-b border-gray-100" />
      {Array.from({ length: 10 }).map((_, i) => (
        <div key={i} className="h-11 border-b border-gray-50 last:border-0 px-4 flex items-center gap-4">
          <div className="h-5 bg-gray-200 rounded w-8" />
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-4 bg-gray-100 rounded w-24 hidden sm:block" />
          <div className="ml-auto h-4 bg-gray-100 rounded w-12" />
          <div className="h-4 bg-gray-100 rounded w-10" />
        </div>
      ))}
    </div>
  )
}

interface DriverDetailPanelProps {
  driverId: string
  detail: DriverDetail | null
  isLoading: boolean
  hasError: boolean
  historyResults: RaceResult[]
}

function DriverDetailPanel({ driverId, detail, isLoading, hasError, historyResults }: DriverDetailPanelProps) {
  return (
    <div className="rounded-b-2xl border border-gray-100 border-t-0 bg-gray-50 overflow-hidden">
      {isLoading && (
        <div className="p-5 space-y-4 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-3/4" />
          <div className="h-3 bg-gray-100 rounded w-full" />
          <div className="space-y-2 mt-2">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="h-9 bg-gray-200 rounded" />
            ))}
          </div>
        </div>
      )}

      {!isLoading && hasError && (
        <p className="p-5 text-sm text-gray-400 text-center">
          No se pudieron cargar los datos de este piloto.
        </p>
      )}

      {!isLoading && !hasError && detail && (
        <div className="p-5 space-y-4">
          <div className="bg-indigo-50 border border-indigo-100 rounded-xl p-4">
            <p className="text-xs font-semibold text-indigo-600 uppercase tracking-wide mb-1">Conclusión</p>
            <p className="text-sm text-gray-800">{conclusionText(detail.summary)}</p>
          </div>

          {/* Circuitos fuertes / débiles */}
          {(() => {
            const cp = getCircuitPerformance(detail.results, historyResults)
            return (
              <div className="bg-white rounded-xl border border-gray-200 px-4 py-3 text-sm space-y-1">
                {cp.hasEnoughData ? (
                  <>
                    <p className="text-gray-600">
                      Fuerte en:{" "}
                      <span className="font-semibold text-gray-900">{cp.best.join(", ")}</span>
                    </p>
                    <p className="text-gray-600">
                      Débil en:{" "}
                      <span className="font-semibold text-gray-900">{cp.worst.join(", ")}</span>
                    </p>
                    {cp.usedHistorical && (
                      <p className="text-xs text-gray-400 pt-0.5">Basado en histórico disponible</p>
                    )}
                  </>
                ) : (
                  <p className="text-gray-400">Sin datos suficientes por circuito.</p>
                )}
              </div>
            )
          })()}

          {detail.results.length > 0 ? (
            <div className="overflow-x-auto rounded-xl border border-gray-200 bg-white">
              <table className="w-full text-sm">
                <thead>
                  <tr className="bg-gray-50 border-b border-gray-100">
                    <th className="text-left px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">
                      Circuito
                    </th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">
                      Qualy
                    </th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">
                      Resultado
                    </th>
                    <th className="text-center px-4 py-2.5 font-semibold text-gray-500 text-xs uppercase tracking-wide whitespace-nowrap">
                      Estado
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {detail.results.map((race, i) => {
                    const { label, color } = raceStatus(race.status)
                    return (
                      <tr key={i} className="hover:bg-gray-50 transition-colors">
                        <td className="px-4 py-2.5 text-gray-800 font-medium whitespace-nowrap">
                          {race.raceName.replace(" Grand Prix", "").replace(" Premio de", "")}
                        </td>
                        <td className="px-4 py-2.5 text-center text-gray-600">
                          {race.grid === 0 ? "PL" : race.grid != null ? `P${race.grid}` : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center font-semibold text-gray-900">
                          {race.position != null ? `P${race.position}` : "—"}
                        </td>
                        <td className="px-4 py-2.5 text-center">
                          <span className={`inline-block px-2 py-0.5 rounded-full text-xs font-semibold ${color}`}>
                            {label}
                          </span>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          ) : (
            <p className="text-sm text-gray-400 text-center py-3">
              No hay datos de carreras disponibles aún.
            </p>
          )}

          <div className="flex justify-end">
            <Link
              href={`/drivers/${driverId}`}
              className="text-sm text-indigo-600 hover:underline font-medium"
            >
              Ver perfil completo →
            </Link>
          </div>
        </div>
      )}
    </div>
  )
}

function HistoricalSection() {
  const SEASONS = getSeasons()
  const currentYear = SEASONS[SEASONS.length - 1]
  const [data, setData] = useState<HistoricalEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    fetch("/api/rankings/historical")
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [])

  if (loading) {
    return <HistoricalSkeleton />
  }

  if (error || !data) {
    return (
      <div className="text-center py-12 text-gray-400">
        <p>No se pudieron cargar los datos históricos.</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Histórico de temporadas</h2>
        <p className="text-sm text-gray-500 mt-1">
          Rendimiento acumulado 2020–{currentYear}. Ordenado por victorias totales.
        </p>
      </div>
      <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-50 border-b border-gray-100">
              <th className="text-left px-4 py-3 font-semibold text-gray-600 whitespace-nowrap sticky left-0 bg-gray-50">
                Piloto
              </th>
              {SEASONS.map((y) => (
                <th key={y} className="text-center px-3 py-3 font-semibold text-gray-500 whitespace-nowrap">
                  {y}
                </th>
              ))}
              <th className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                Victorias
              </th>
              <th className="text-center px-4 py-3 font-semibold text-gray-600 whitespace-nowrap">
                Podios
              </th>
            </tr>
          </thead>
          <tbody>
            {data.map((entry, i) => (
              <tr
                key={entry.driverId}
                className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
              >
                <td className={`px-4 py-3 whitespace-nowrap sticky left-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}>
                  <Link
                    href={`/drivers/${entry.driverId}`}
                    className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                  >
                    {entry.driverName}
                  </Link>
                </td>
                {SEASONS.map((y) => {
                  const pos = entry.seasonPositions[y]
                  return (
                    <td key={y} className="text-center px-3 py-3 whitespace-nowrap">
                      {pos !== undefined ? (
                        <span
                          className={`inline-block px-2 py-0.5 rounded-lg text-xs font-bold ${
                            pos === 1
                              ? "bg-yellow-100 text-yellow-700"
                              : pos === 2
                              ? "bg-gray-100 text-gray-600"
                              : pos === 3
                              ? "bg-amber-100 text-amber-700"
                              : "text-gray-600"
                          }`}
                        >
                          P{pos}
                        </span>
                      ) : (
                        <span className="text-gray-300 text-xs">—</span>
                      )}
                    </td>
                  )
                })}
                <td className="text-center px-4 py-3">
                  <span className="font-black text-gray-900">{entry.totalWins}</span>
                </td>
                <td className="text-center px-4 py-3">
                  <span className="font-semibold text-gray-600">{entry.totalPodiums}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

function SeasonSection() {
  const SEASONS = getSeasons()
  const currentYear = SEASONS[SEASONS.length - 1]
  const [year, setYear] = useState(currentYear)
  const [data, setData] = useState<SeasonEntry[] | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState(false)

  useEffect(() => {
    setLoading(true)
    setError(false)
    setData(null)
    const apiYear = year === currentYear ? "current" : year
    fetch(`/api/rankings/season?year=${apiYear}`)
      .then((r) => {
        if (!r.ok) throw new Error()
        return r.json()
      })
      .then(setData)
      .catch(() => setError(true))
      .finally(() => setLoading(false))
  }, [year, currentYear])

  return (
    <div className="space-y-4">
      <div>
        <h2 className="text-xl font-bold text-gray-900">Ranking por temporada</h2>
        <p className="text-sm text-gray-500 mt-1">Clasificación final del campeonato de pilotos.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        {SEASONS.map((y) => (
          <button
            key={y}
            onClick={() => setYear(y)}
            className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
              year === y
                ? "bg-indigo-600 text-white"
                : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
            }`}
          >
            {y}
          </button>
        ))}
      </div>

      {loading && <SeasonSkeleton />}

      {!loading && (error || !data || data.length === 0) && (
        <div className="text-center py-12 text-gray-400">
          <p>No hay datos disponibles para {year}.</p>
        </div>
      )}

      {!loading && data && data.length > 0 && (
        <div className="overflow-x-auto rounded-2xl border border-gray-100 shadow-sm bg-white">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-100">
                <th className="text-center px-4 py-3 font-semibold text-gray-500 w-16">Pos.</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600">Piloto</th>
                <th className="text-left px-4 py-3 font-semibold text-gray-600 hidden sm:table-cell">
                  Equipo
                </th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Puntos</th>
                <th className="text-center px-4 py-3 font-semibold text-gray-600">Victorias</th>
              </tr>
            </thead>
            <tbody>
              {data.map((entry, i) => (
                <tr
                  key={entry.driverId}
                  className={`border-b border-gray-50 last:border-0 ${i % 2 === 0 ? "bg-white" : "bg-gray-50/40"}`}
                >
                  <td className="text-center px-4 py-3">
                    <span
                      className={`inline-block w-8 text-center font-bold rounded-lg py-0.5 text-xs ${
                        entry.position === 1
                          ? "bg-yellow-100 text-yellow-700"
                          : entry.position === 2
                          ? "bg-gray-100 text-gray-600"
                          : entry.position === 3
                          ? "bg-amber-100 text-amber-700"
                          : "text-gray-400"
                      }`}
                    >
                      {entry.position}
                    </span>
                  </td>
                  <td className="px-4 py-3">
                    <Link
                      href={`/drivers/${entry.driverId}`}
                      className="font-medium text-gray-900 hover:text-indigo-600 transition-colors"
                    >
                      {entry.driverName}
                    </Link>
                  </td>
                  <td className="px-4 py-3 text-gray-500 hidden sm:table-cell">
                    {entry.constructorName}
                  </td>
                  <td className="text-center px-4 py-3 font-bold text-gray-900">{entry.points}</td>
                  <td className="text-center px-4 py-3 font-semibold text-gray-600">{entry.wins}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

type FreeTab = "all" | "improving" | "consistent" | "unstable"
type PremiumSection = "historico" | "por-temporada"

export default function RankingsPage() {
  const [data, setData] = useState<RankingsData | null>(null)
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<FreeTab>("all")
  const [activePremium, setActivePremium] = useState<PremiumSection | null>(null)
  const [expandedId, setExpandedId] = useState<string | null>(null)
  const [detailsCache, setDetailsCache] = useState<Record<string, DetailState>>({})
  const [historyCache, setHistoryCache] = useState<Record<string, RaceResult[]>>({})
  const [loadingDetail, setLoadingDetail] = useState<string | null>(null)

  useEffect(() => {
    fetch("/api/rankings")
      .then((r) => r.json())
      .then(setData)
      .catch(() => {})
      .finally(() => setLoading(false))
  }, [])

  async function handleToggle(driverId: string) {
    if (expandedId === driverId) {
      setExpandedId(null)
      return
    }
    setExpandedId(driverId)

    if (!detailsCache[driverId] && loadingDetail !== driverId) {
      setLoadingDetail(driverId)
      try {
        const r = await fetch(`/api/drivers/${driverId}/results`)
        if (!r.ok) throw new Error()
        const detail: DriverDetail = await r.json()
        setDetailsCache((prev) => ({ ...prev, [driverId]: { data: detail, error: false } }))
      } catch {
        setDetailsCache((prev) => ({ ...prev, [driverId]: { data: null, error: true } }))
      } finally {
        setLoadingDetail(null)
      }
    }

    if (!historyCache[driverId]) {
      fetch(`/api/drivers/${driverId}/history`)
        .then((r) => r.json())
        .then((d) => setHistoryCache((prev) => ({ ...prev, [driverId]: d.results ?? [] })))
        .catch(() => {})
    }
  }

  const freeTabs: { key: FreeTab; label: string }[] = [
    { key: "all", label: "Todos" },
    { key: "improving", label: "En mejora" },
    { key: "consistent", label: "Consistentes" },
    { key: "unstable", label: "Inestables" },
  ]

  const premiumTabs: { key: PremiumSection; label: string }[] = [
    { key: "historico", label: "Histórico" },
    { key: "por-temporada", label: "Por temporada" },
  ]

  function handleFreeTab(key: FreeTab) {
    setActiveTab(key)
    setActivePremium(null)
    setExpandedId(null)
  }

  function handlePremiumTab(key: PremiumSection) {
    setActivePremium((prev) => (prev === key ? null : key))
  }

  const entries = data ? data[activeTab] : []

  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Rankings</h1>
        <p className="text-gray-500 mt-1">
          Pilotos clasificados por rendimiento y tendencia reciente.
        </p>
      </div>

      {/* Tabs */}
      <div className="space-y-4">
        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Rankings</p>
          <div className="flex flex-wrap gap-2">
            {freeTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handleFreeTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium transition-colors ${
                  activePremium === null && activeTab === tab.key
                    ? "bg-indigo-600 text-white"
                    : "bg-white border border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        <div>
          <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">Análisis avanzado</p>
          <div className="flex flex-wrap gap-2">
            {premiumTabs.map((tab) => (
              <button
                key={tab.key}
                onClick={() => handlePremiumTab(tab.key)}
                className={`px-4 py-2 rounded-xl text-sm font-medium border transition-colors ${
                  activePremium === tab.key
                    ? "bg-indigo-600 text-white border-indigo-600"
                    : "bg-white border-gray-200 text-gray-600 hover:border-indigo-200 hover:text-indigo-600"
                }`}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Premium content */}
      {activePremium === "historico" && <HistoricalSection />}
      {activePremium === "por-temporada" && <SeasonSection />}

      {/* Free content */}
      {activePremium === null && (
        <>
          {loading && <RankingsSkeleton />}

          {!loading && entries.length === 0 && (
            <div className="text-center py-12 text-gray-400 space-y-2">
              <p>No hay pilotos en esta categoría todavía.</p>
            </div>
          )}

          {!loading && entries.length > 0 && (
            <div className="space-y-3">
              {entries.map((entry, i) => {
                const isExpanded = expandedId === entry.driverId
                const cached = detailsCache[entry.driverId]
                return (
                  <div key={entry.driverId}>
                    <RankingCard
                      rank={i + 1}
                      driverName={entry.driverName}
                      constructorName={entry.constructorName}
                      statusLabel={entry.statusLabel}
                      trend={entry.trend}
                      totalPoints={entry.totalPoints}
                      standingPosition={entry.standingPosition}
                      lastFiveAvg={entry.lastFiveAveragePosition}
                      isExpanded={isExpanded}
                      onClick={() => handleToggle(entry.driverId)}
                    />
                    {isExpanded && (
                      <DriverDetailPanel
                        driverId={entry.driverId}
                        detail={cached?.data ?? null}
                        isLoading={loadingDetail === entry.driverId}
                        hasError={cached?.error ?? false}
                        historyResults={historyCache[entry.driverId] ?? []}
                      />
                    )}
                  </div>
                )
              })}
            </div>
          )}
        </>
      )}

    </div>
  )
}
