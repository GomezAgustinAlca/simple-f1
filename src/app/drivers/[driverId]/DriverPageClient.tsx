"use client"

import { useAuth } from "@/contexts/AuthContext"
import { RaceEvolutionChart } from "@/components/RaceEvolutionChart"
import { RecentRaceTable } from "@/components/RecentRaceTable"
import { TeammateComparisonCard } from "@/components/TeammateComparisonCard"
import { NewsCard } from "@/components/NewsCard"
import { AdSlot } from "@/components/AdSlot"
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
  const { isPremium } = useAuth()
  const [news, setNews] = useState<NewsItem[]>([])
  const [loadingNews, setLoadingNews] = useState(false)
  const [historyResults, setHistoryResults] = useState<RaceResult[]>([])

  useEffect(() => {
    if (!isPremium) return
    fetch(`/api/drivers/${summary.driverId}/history`)
      .then((r) => r.json())
      .then((d) => setHistoryResults(d.results ?? []))
      .catch(() => {})
  }, [isPremium, summary.driverId])

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
    if (!isPremium) return
    setLoadingNews(true)
    fetch(`/api/news/${summary.driverId}`)
      .then((r) => r.json())
      .then((d) => setNews(d.news ?? []))
      .catch(() => {})
      .finally(() => setLoadingNews(false))
  }, [isPremium, summary.driverId])

  const lastFinishedDNF = lastRace ? isDNF(lastRace.status) : false
  const prevFinishedDNF = prevRace ? isDNF(prevRace.status) : false

  return (
    <div className="space-y-10">
      {/* Análisis rápido */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-indigo-700 mb-2">Análisis rápido</p>
        <p className="text-gray-800">Nivel actual: {summary.statusLabel}</p>
        {isPremium ? (
          <p className="text-gray-700 text-sm mt-2">{premiumTrendExplanation}</p>
        ) : (
          <div className="flex items-center gap-3 mt-1">
            <p className="text-gray-600 text-sm blur-sm select-none flex-1">Motivo: {summary.summaryText}</p>
            <a
              href="/premium"
              className="shrink-0 text-xs font-semibold text-indigo-700 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
            >
              Ver por qué
            </a>
          </div>
        )}
      </div>

      {/* Perfil avanzado — premium gate */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900">Perfil avanzado</h2>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Premium</span>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {advancedMetrics.map((m) => (
            <div key={m.title} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-1">
              <p className="text-xs text-gray-400 uppercase tracking-wide">{m.title}</p>
              <p className="text-sm font-semibold text-gray-900">{m.label}</p>
              {isPremium ? (
                <p className="text-xs text-gray-600">{m.premiumExplanation}</p>
              ) : (
                <p className="text-xs text-gray-500 blur-sm select-none">{m.explanation}</p>
              )}
            </div>
          ))}
        </div>
        {!isPremium && (
          <a
            href="/premium"
            className="inline-flex items-center gap-1 text-xs font-semibold text-indigo-700 hover:text-indigo-900 transition-colors"
          >
            Entender el rendimiento →
          </a>
        )}
      </section>

      {/* Perfil por circuitos — premium gate */}
      <section className="space-y-4">
        <div className="flex items-center gap-2">
          <h2 className="font-bold text-gray-900">Perfil por circuitos</h2>
          <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Premium</span>
        </div>
        {isPremium ? (
          (() => {
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
          })()
        ) : (
          <a
            href="https://simplef1.lemonsqueezy.com/checkout/buy/a17d801a-9e92-4da7-9e2b-e314c6d30906"
            target="_blank"
            rel="noopener noreferrer"
            className="block relative group rounded-2xl overflow-hidden"
          >
            <div className="bg-white border border-gray-100 shadow-sm p-5 space-y-3 select-none pointer-events-none">
              <div className="flex items-center gap-3">
                <div className="w-28 h-5 bg-green-100 rounded-full" />
                <div className="w-32 h-4 bg-gray-100 rounded" />
              </div>
              <div className="flex items-center gap-3">
                <div className="w-28 h-5 bg-orange-100 rounded-full" />
                <div className="w-24 h-4 bg-gray-100 rounded" />
              </div>
            </div>
            <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
              <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow group-hover:bg-indigo-700 transition-colors">
                Desbloqueá en qué circuitos rinde mejor
              </span>
            </div>
          </a>
        )}
      </section>

      {/* Evolution chart */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Evolución de resultados</h2>
          {!isPremium && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Últimas 5 carreras
            </span>
          )}
          {isPremium && (
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              Temporada completa
            </span>
          )}
        </div>
        <RaceEvolutionChart results={results} isPremium={isPremium} />
      </section>

      {/* Recent race table */}
      <section className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="font-bold text-gray-900">Últimas carreras</h2>
          {!isPremium && (
            <span className="text-xs text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
              Últimas 5
            </span>
          )}
        </div>
        <RecentRaceTable results={results} isPremium={isPremium} />
      </section>

      {!isPremium && <AdSlot slot="driver-mid" />}

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

      {/* Off-season news (premium only) */}
      {isPremium && (
        <section className="space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="font-bold text-gray-900">Noticias recientes</h2>
            <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">
              Premium
            </span>
          </div>
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
      )}
    </div>
  )
}
