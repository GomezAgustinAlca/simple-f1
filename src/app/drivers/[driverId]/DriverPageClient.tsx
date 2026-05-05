"use client"

import { RaceEvolutionChart } from "@/components/RaceEvolutionChart"
import { RecentRaceTable } from "@/components/RecentRaceTable"
import { TeammateComparisonCard } from "@/components/TeammateComparisonCard"
import { NewsCard } from "@/components/NewsCard"
import { formatPosition, positionChange } from "@/lib/format"
import { isDNF, getConsistency, getCircuitTypePerformance, getGridPositionImpact, getCircuitPerformance } from "@/lib/performance"
import { getPremiumSummaryText } from "@/lib/summaries"
import type { RaceResult, DriverPerformanceSummary, TeammateComparison } from "@/types/f1"
import type { NewsItem } from "@/types/news"
import { useEffect, useState } from "react"

interface Props {
  results: RaceResult[]
  summary: DriverPerformanceSummary
  lastRace: RaceResult | null
  prevRace: RaceResult | null
  teammate: TeammateComparison | null
}

export function DriverPageClient({ results, summary, lastRace, prevRace, teammate }: Props) {
  const [news, setNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [historyResults, setHistoryResults] = useState<RaceResult[]>([])

  useEffect(() => {
    fetch(`/api/drivers/${summary.driverId}/history`)
      .then((r) => r.json())
      .then((d) => setHistoryResults(d.results ?? []))
      .catch(() => {})
  }, [summary.driverId])

  const premiumTrendExplanation = getPremiumSummaryText(summary.trend, summary.lastFiveAveragePosition)

  const advancedMetrics = [
    {
      title: "Consistencia",
      ...getConsistency(results),
    },
    {
      title: "Tendencia",
      label: summary.statusLabel,
      explanation: summary.summaryText,
      premiumExplanation: premiumTrendExplanation,
    },
    {
      title: "Por tipo de circuito",
      ...getCircuitTypePerformance(results),
    },
    {
      title: "Vs posición de salida",
      ...getGridPositionImpact(results),
    },
  ]

  useEffect(() => {
    setLoadingNews(true)
    fetch(`/api/news/${summary.driverId}`)
      .then((r) => r.json())
      .then((d) => setNews(d.news ?? []))
      .catch(() => {})
      .finally(() => setLoadingNews(false))
  }, [summary.driverId])

  const lastFinishedDNF = lastRace ? isDNF(lastRace.status) : false
  const prevFinishedDNF = prevRace ? isDNF(prevRace.status) : false

  return (
    <div className="space-y-10">
      {/* Análisis rápido */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-indigo-700 mb-2">Análisis rápido</p>
        <p className="text-gray-800">Nivel actual: {summary.statusLabel}</p>
        <p className="text-gray-700 text-sm mt-2">{premiumTrendExplanation}</p>
      </div>

      {/* Análisis avanzado */}
      <section className="space-y-4">
        <h2 className="font-bold text-gray-900">Análisis avanzado</h2>
        <div className="grid grid-cols-2 gap-4">
          {advancedMetrics.map((m) => (
            <div key={m.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{m.title}</p>
              <p className="text-sm font-semibold text-gray-900">{m.label}</p>
              <p className="text-xs text-gray-600">{m.premiumExplanation}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Perfil por circuitos */}
      <section className="space-y-4">
        <h2 className="font-bold text-gray-900">Perfil por circuitos</h2>
        {(() => {
          const cp = getCircuitPerformance(results, historyResults)
          return cp.hasEnoughData ? (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-green-700 bg-green-50 px-2.5 py-1 rounded-full shrink-0">
                  Mejor rendimiento
                </span>
                <p className="text-sm text-gray-800">{cp.best.join(", ")}</p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-full shrink-0">
                  Peor rendimiento
                </span>
                <p className="text-sm text-gray-800">{cp.worst.join(", ")}</p>
              </div>
              {cp.usedHistorical && (
                <p className="text-xs text-gray-400 pt-1">Basado en histórico disponible</p>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
              <p className="text-sm text-gray-400">
                Sin datos suficientes — se necesitan al menos 2 carreras en el mismo circuito.
              </p>
            </div>
          )
        })()}
      </section>

      {/* Evolution chart */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Evolución de resultados</h2>
        <RaceEvolutionChart results={results} />
      </section>

      {/* Recent race table */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <h2 className="font-bold text-gray-900">Últimas carreras</h2>
        <RecentRaceTable results={results} />
      </section>

      {/* Last vs previous comparison */}
      {lastRace && prevRace && (
        <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
          <h2 className="font-bold text-gray-900 mb-4">Comparación vs carrera anterior</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
            <div>
              <p className="text-xs text-gray-400 mb-1">Carrera anterior</p>
              <p className="text-2xl font-black text-gray-900">
                {prevFinishedDNF ? (
                  <span className="text-red-400 text-xl">DNF</span>
                ) : (
                  formatPosition(prevRace.position)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">{prevRace.raceName.replace(" Grand Prix", "")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Última carrera</p>
              <p className="text-2xl font-black text-gray-900">
                {lastFinishedDNF ? (
                  <span className="text-red-400 text-xl">DNF</span>
                ) : (
                  formatPosition(lastRace.position)
                )}
              </p>
              <p className="text-xs text-gray-500 mt-1 truncate">{lastRace.raceName.replace(" Grand Prix", "")}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Cambio</p>
              <p className="text-2xl font-black text-gray-900">
                {lastRace.position != null && prevRace.position != null
                  ? positionChange(lastRace.position, prevRace.position)
                  : "—"}
              </p>
              <p className="text-xs text-gray-500 mt-1">posiciones</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 mb-1">Resultado</p>
              <p className="text-sm font-semibold text-gray-700 mt-2">
                {lastRace.position != null && prevRace.position != null
                  ? lastRace.position < prevRace.position
                    ? "Mejoró"
                    : lastRace.position > prevRace.position
                    ? "Bajó"
                    : "Igual"
                  : "—"}
              </p>
            </div>
          </div>
        </section>
      )}

      {/* Teammate comparison */}
      {teammate && (
        <TeammateComparisonCard comparison={teammate} />
      )}

      {/* Noticias recientes */}
      <section className="space-y-4">
        <h2 className="font-bold text-gray-900">Noticias recientes</h2>
        {loadingNews && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {Array.from({ length: 4 }).map((_, i) => (
              <div key={i} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 space-y-3 animate-pulse">
                <div className="h-4 bg-gray-200 rounded w-3/4" />
                <div className="h-3 bg-gray-100 rounded w-full" />
                <div className="h-3 bg-gray-100 rounded w-2/3" />
                <div className="h-3 bg-gray-100 rounded w-20" />
              </div>
            ))}
          </div>
        )}
        {!loadingNews && news.length === 0 && (
          <p className="text-sm text-gray-400">
            No se encontraron noticias recientes sobre este piloto.
          </p>
        )}
        {news.length > 0 && (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {news.map((item, i) => (
              <NewsCard key={i} item={item} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}
