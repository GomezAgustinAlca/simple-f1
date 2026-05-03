"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CompareTable } from "@/components/CompareTable"
import { RaceEvolutionChart } from "@/components/RaceEvolutionChart"
import { PremiumBanner } from "@/components/PremiumBanner"
import { PremiumModal } from "@/components/PremiumModal"
import { AdSlot } from "@/components/AdSlot"
// import { TrackDuel } from "@/components/duel/TrackDuel"  // DUEL DESACTIVADO
import { useAuth } from "@/contexts/AuthContext"
import type { DriverStanding, DriverPerformanceSummary, RaceResult } from "@/types/f1"
import { getTeamColor } from "@/components/duel/circuitData"
import { getCompareWinner } from "@/lib/performance"


function CompareSkeleton() {
  return (
    <div className="space-y-8">
      <div className="h-14 bg-gray-100 rounded-2xl animate-pulse" />
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="flex items-center gap-4 py-4 px-4 border-b border-gray-100 bg-gray-50 animate-pulse">
          <div className="flex-1 h-4 bg-gray-200 rounded" />
          <div className="w-24 h-4 bg-gray-200 rounded" />
          <div className="w-24 h-4 bg-gray-200 rounded" />
        </div>
        {Array.from({ length: 8 }).map((_, i) => (
          <div key={i} className="flex items-center gap-4 py-3.5 px-4 border-b border-gray-50 last:border-0 animate-pulse">
            <div className="flex-1 h-4 bg-gray-100 rounded" />
            <div className="w-16 h-5 bg-gray-200 rounded" />
            <div className="w-16 h-5 bg-gray-100 rounded" />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3 animate-pulse">
          <div className="h-4 bg-gray-200 rounded w-32" />
          <div className="h-40 bg-gray-100 rounded-xl" />
        </div>
      </div>
    </div>
  )
}

interface DriverData {
  results: RaceResult[]
  summary: DriverPerformanceSummary
}

type Tab = "compare" | "duel"

function CompareContent() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const { isPremium } = useAuth()

  const [tab, setTab] = useState<Tab>("compare")
  // const [showPremiumModal, setShowPremiumModal] = useState(false)  // DUEL DESACTIVADO
  const [drivers, setDrivers] = useState<DriverStanding[]>([])
  const [driverA, setDriverA] = useState(searchParams.get("driverA") ?? "")
  const [driverB, setDriverB] = useState(searchParams.get("driverB") ?? "")
  const [dataA, setDataA] = useState<DriverData | null>(null)
  const [dataB, setDataB] = useState<DriverData | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  useEffect(() => {
    fetch("/api/drivers")
      .then((r) => r.json())
      .then((d) => setDrivers(d.standings ?? []))
      .catch(() => {})
  }, [])

  useEffect(() => {
    if (!driverA || !driverB) return
    setLoading(true)
    setError("")
    router.replace(`/compare?driverA=${driverA}&driverB=${driverB}`)
    fetch(`/api/compare?driverA=${driverA}&driverB=${driverB}`)
      .then((r) => r.json())
      .then((d) => {
        setDataA(d.driverA)
        setDataB(d.driverB)
      })
      .catch(() => setError("No se pudieron cargar los datos. Intentá de nuevo."))
      .finally(() => setLoading(false))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [driverA, driverB])

  const standingA = drivers.find((d) => d.driverId === driverA)
  const standingB = drivers.find((d) => d.driverId === driverB)
  const fullNameA = standingA ? `${standingA.givenName} ${standingA.familyName}` : driverA
  const fullNameB = standingB ? `${standingB.givenName} ${standingB.familyName}` : driverB
  const colorA = standingA ? getTeamColor(standingA.constructorName.toLowerCase().replace(/ /g, "_")) : "#6B7280"
  const colorB = standingB ? getTeamColor(standingB.constructorName.toLowerCase().replace(/ /g, "_")) : "#6B7280"

  // DUEL DESACTIVADO — descomentar para reactivar
  // function handleDuelTabClick() {
  //   if (!isPremium) {
  //     setShowPremiumModal(true)
  //     return
  //   }
  //   setTab("duel")
  // }

  return (
    <div className="space-y-8">
      {/* Tabs — pestaña Duelo desactivada; descomentar el bloque para reactivar */}
      <div className="flex gap-1 bg-gray-100 rounded-xl p-1 w-fit">
        <button
          onClick={() => setTab("compare")}
          className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "compare"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Comparación
        </button>
        {/* DUEL DESACTIVADO — descomentar para reactivar
        <button
          onClick={handleDuelTabClick}
          className={`flex items-center gap-1.5 px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${
            tab === "duel"
              ? "bg-white text-gray-900 shadow-sm"
              : "text-gray-500 hover:text-gray-700"
          }`}
        >
          Duelo en pista
          <span className="text-xs bg-indigo-600 text-white px-1.5 py-0.5 rounded-md font-bold leading-none">
            Premium
          </span>
        </button>
        */}
      </div>

      {/* Tab: Comparación */}
      {tab === "compare" && (
        <div className="space-y-10">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Piloto A</label>
              <select
                value={driverA}
                onChange={e => setDriverA(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar piloto...</option>
                {drivers.map(d => (
                  <option key={d.driverId} value={d.driverId}>
                    {d.givenName} {d.familyName}
                  </option>
                ))}
              </select>
              {standingA && (
                <p className="text-xs font-medium" style={{ color: colorA }}>{standingA.constructorName}</p>
              )}
            </div>
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Piloto B</label>
              <select
                value={driverB}
                onChange={e => setDriverB(e.target.value)}
                className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="">Seleccionar piloto...</option>
                {drivers.map(d => (
                  <option key={d.driverId} value={d.driverId} disabled={d.driverId === driverA}>
                    {d.givenName} {d.familyName}
                  </option>
                ))}
              </select>
              {standingB && (
                <p className="text-xs font-medium" style={{ color: colorB }}>{standingB.constructorName}</p>
              )}
            </div>
          </div>

          {!isPremium && <AdSlot slot="compare-top" />}

          {loading && <CompareSkeleton />}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-red-600 text-sm">
              {error}
            </div>
          )}

          {!loading && dataA && dataB && (
            <div className="space-y-8">
              {isPremium ? (
                (() => {
                  const winner = getCompareWinner(dataA.summary, dataB.summary)
                  const winnerName = winner === "A" ? fullNameA : winner === "B" ? fullNameB : null
                  return (
                    <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3.5">
                      <p className="text-sm font-bold text-indigo-700">
                        {winnerName ? `${winnerName} está mejor actualmente` : "Están equilibrados actualmente"}
                      </p>
                    </div>
                  )
                })()
              ) : (
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3.5">
                  <p className="text-sm font-bold text-indigo-700">
                    Se detectan diferencias entre los pilotos
                  </p>
                </div>
              )}
              <CompareTable
                nameA={fullNameA}
                nameB={fullNameB}
                summaryA={dataA.summary}
                summaryB={dataB.summary}
                resultsA={dataA.results}
                resultsB={dataB.results}
                isPremium={isPremium}
              />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <p className="font-semibold text-gray-900 text-sm">{fullNameA}</p>
                  <RaceEvolutionChart results={dataA.results} isPremium={isPremium} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <p className="font-semibold text-gray-900 text-sm">{fullNameB}</p>
                  <RaceEvolutionChart results={dataB.results} isPremium={isPremium} />
                </div>
              </div>
            </div>
          )}

          {(!driverA || !driverB) && !loading && (
            <div className="text-center py-12 text-gray-400">
              <p>Seleccioná dos pilotos para comenzar la comparación.</p>
            </div>
          )}

          <PremiumBanner />
        </div>
      )}

      {/* DUEL DESACTIVADO — descomentar para reactivar
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-6">
        {tab === "duel" && isPremium && <TrackDuel drivers={drivers} />}
      </div>
      */}

      {/* {showPremiumModal && <PremiumModal onClose={() => setShowPremiumModal(false)} />} */}
    </div>
  )
}

export default function ComparePage() {
  return (
    <div className="max-w-5xl mx-auto px-4 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-black text-gray-900">Comparar pilotos</h1>
        <p className="text-gray-500 mt-1">
          Elegí dos pilotos para comparar su rendimiento de la temporada actual.
        </p>
      </div>
      <Suspense
        fallback={
          <div className="text-center py-12 text-gray-400">
            <p className="animate-pulse">Cargando...</p>
          </div>
        }
      >
        <CompareContent />
      </Suspense>
    </div>
  )
}
