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
import { getCompareWinner, getCircuitAdvantage } from "@/lib/performance"


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
  const [historyA, setHistoryA] = useState<import("@/types/f1").RaceResult[]>([])
  const [historyB, setHistoryB] = useState<import("@/types/f1").RaceResult[]>([])
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [showCircuitDetail, setShowCircuitDetail] = useState(false)

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

  useEffect(() => {
    if (!isPremium || !driverA || !driverB) {
      setHistoryA([])
      setHistoryB([])
      return
    }
    Promise.all([
      fetch(`/api/drivers/${driverA}/history`).then((r) => r.json()).catch(() => ({ results: [] })),
      fetch(`/api/drivers/${driverB}/history`).then((r) => r.json()).catch(() => ({ results: [] })),
    ]).then(([ha, hb]) => {
      setHistoryA(ha.results ?? [])
      setHistoryB(hb.results ?? [])
    })
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isPremium, driverA, driverB])

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
              {isPremium && (() => {
                const winner = getCompareWinner(dataA.summary, dataB.summary)
                const winnerName = winner === "A" ? fullNameA : winner === "B" ? fullNameB : null
                return (
                  <div className="bg-indigo-50 border border-indigo-100 rounded-2xl px-5 py-3.5">
                    <p className="text-sm font-bold text-indigo-700">
                      {winnerName ? `${winnerName} está mejor actualmente` : "Están equilibrados actualmente"}
                    </p>
                  </div>
                )
              })()}
              <CompareTable
                nameA={fullNameA}
                nameB={fullNameB}
                summaryA={dataA.summary}
                summaryB={dataB.summary}
                resultsA={dataA.results}
                resultsB={dataB.results}
                isPremium={isPremium}
              />

              {/* Ventaja por circuito — premium gate */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <h2 className="font-bold text-gray-900 text-sm">Ventaja por circuito</h2>
                  <span className="text-xs text-indigo-600 bg-indigo-50 px-2 py-1 rounded-full">Premium</span>
                </div>
                {isPremium ? (
                  (() => {
                    const { advantages, usedHistorical } = getCircuitAdvantage(
                      dataA.results, dataB.results, fullNameA, fullNameB, historyA, historyB
                    )
                    if (advantages.length === 0) {
                      return (
                        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5">
                          <p className="text-sm text-gray-400">Sin datos suficientes para comparar por circuito.</p>
                        </div>
                      )
                    }
                    const countA = advantages.filter((a) => a.winner === fullNameA).length
                    const countB = advantages.filter((a) => a.winner === fullNameB).length
                    const total = advantages.length
                    const dominant = countA > countB ? fullNameA : countB > countA ? fullNameB : null
                    const interpretation = dominant
                      ? `${dominant.split(" ").pop()} tiene ventaja en el ${Math.round((Math.max(countA, countB) / total) * 100)}% de los circuitos comparados.`
                      : "Equilibrio: ambos pilotos dominan en igual cantidad de circuitos."
                    const byA = advantages.filter((a) => a.winner === fullNameA)
                    const byB = advantages.filter((a) => a.winner === fullNameB)
                    const groups = [
                      { label: `Ventaja ${fullNameA.split(" ").pop()}`, items: byA, pill: "text-indigo-700 bg-indigo-50" },
                      { label: `Ventaja ${fullNameB.split(" ").pop()}`, items: byB, pill: "text-orange-700 bg-orange-50" },
                    ].filter((g) => g.items.length > 0)
                    return (
                      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                        <div className="flex flex-wrap gap-2">
                          {countA > 0 && (
                            <span className="bg-indigo-50 text-indigo-700 text-xs font-medium px-3 py-1 rounded-full">
                              {fullNameA.split(" ").pop()} domina: {countA} {countA === 1 ? "circuito" : "circuitos"}
                            </span>
                          )}
                          {countB > 0 && (
                            <span className="bg-orange-50 text-orange-700 text-xs font-medium px-3 py-1 rounded-full">
                              {fullNameB.split(" ").pop()} domina: {countB} {countB === 1 ? "circuito" : "circuitos"}
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-gray-500 italic">{interpretation}</p>
                        <button
                          onClick={() => setShowCircuitDetail((v) => !v)}
                          className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-1"
                        >
                          {showCircuitDetail ? "Ocultar detalle" : "Ver detalle por circuito"}
                          <span className="text-gray-400 ml-0.5">{showCircuitDetail ? "▲" : "▼"}</span>
                        </button>
                        {showCircuitDetail && (
                          <div className="space-y-4 border-t border-gray-50 pt-3">
                            {groups.map((group) => (
                              <div key={group.label}>
                                <span className={`text-xs font-semibold px-2 py-0.5 rounded-full inline-block mb-2 ${group.pill}`}>
                                  {group.label}
                                </span>
                                <div className="space-y-2">
                                  {group.items.map((adv) => (
                                    <div key={adv.circuit} className="space-y-1">
                                      <div className="flex items-center gap-2 text-sm">
                                        <span className="font-medium text-gray-800">{adv.circuit}</span>
                                        <span className="text-xs text-gray-400 ml-auto">prom. P{adv.posA} vs P{adv.posB}</span>
                                      </div>
                                      {adv.races.map((race) => (
                                        <div key={race.year} className="flex items-center gap-2 text-xs text-gray-500 pl-3 border-l-2 border-gray-100">
                                          <span className="text-gray-400 shrink-0">{race.year}</span>
                                          <span className="truncate">{race.gpName}</span>
                                          <span className="ml-auto shrink-0 text-gray-400">P{race.posA} vs P{race.posB}</span>
                                        </div>
                                      ))}
                                    </div>
                                  ))}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                        {usedHistorical && (
                          <p className="text-xs text-gray-400">Basado en histórico disponible</p>
                        )}
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
                    <div className="bg-white border border-gray-100 shadow-sm p-5 space-y-2 select-none pointer-events-none">
                      <div className="flex items-center gap-2">
                        <div className="w-36 h-4 bg-gray-100 rounded" />
                        <div className="w-24 h-4 bg-gray-200 rounded ml-auto" />
                      </div>
                      <div className="flex items-center gap-2">
                        <div className="w-32 h-4 bg-gray-100 rounded" />
                        <div className="w-20 h-4 bg-gray-200 rounded ml-auto" />
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center bg-white/75 backdrop-blur-[2px]">
                      <span className="bg-indigo-600 text-white text-xs font-semibold px-4 py-2 rounded-full shadow group-hover:bg-indigo-700 transition-colors">
                        Desbloqueá quién rinde mejor en cada circuito
                      </span>
                    </div>
                  </a>
                )}
              </div>

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
