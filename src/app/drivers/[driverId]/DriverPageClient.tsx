"use client"

import { useAuth } from "@/contexts/AuthContext"
import { RaceEvolutionChart } from "@/components/RaceEvolutionChart"
import { RecentRaceTable } from "@/components/RecentRaceTable"
import { TeammateComparisonCard } from "@/components/TeammateComparisonCard"
import { NewsCard } from "@/components/NewsCard"
import { AdSlot } from "@/components/AdSlot"
import { formatPosition, positionChange } from "@/lib/format"
import { isDNF } from "@/lib/performance"
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
