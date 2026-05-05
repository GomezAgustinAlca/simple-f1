"use client"

import { Suspense, useState, useEffect } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { CompareTable } from "@/components/CompareTable"
import { RaceEvolutionChart } from "@/components/RaceEvolutionChart"
// import { TrackDuel } from "@/components/duel/TrackDuel"  // DUEL DESACTIVADO
import type { DriverStanding, DriverPerformanceSummary, RaceResult } from "@/types/f1"
import { getTeamColor } from "@/components/duel/circuitData"
import { getCircuitAdvantage, avgPositionToLabel } from "@/lib/performance"
import { CompareDecisionBlock } from "@/components/CompareDecisionBlock"
import { CompareDriverCard } from "@/components/CompareDriverCard"


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
  const [showAllCircuits, setShowAllCircuits] = useState(false)
  const [expandedCircuit, setExpandedCircuit] = useState<string | null>(null)

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
    if (!driverA || !driverB) {
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
        <div className="space-y-6">
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

          {loading && <CompareSkeleton />}

          {error && (
            <div className="bg-red-50 border border-red-100 rounded-2xl p-5 text-red-600 text-sm">
              {error}
            </div>
          )}

          {!loading && dataA && dataB && (
            <div className="space-y-6">
              <CompareDecisionBlock
                nameA={fullNameA}
                nameB={fullNameB}
                summaryA={dataA.summary}
                summaryB={dataB.summary}
              />
              {standingA && standingB && (
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 items-stretch">
                  <CompareDriverCard standing={standingA} summary={dataA.summary} color={colorA} />
                  <CompareDriverCard standing={standingB} summary={dataB.summary} color={colorB} />
                </div>
              )}
              <CompareTable
                nameA={fullNameA}
                nameB={fullNameB}
                summaryA={dataA.summary}
                summaryB={dataB.summary}
                resultsA={dataA.results}
                resultsB={dataB.results}
              />

              {/* Ventaja por circuito */}
              <div className="space-y-1.5">
                <h2 className="text-xs font-medium text-gray-400 uppercase tracking-wide">Ventaja por circuito</h2>
                {(() => {
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
                  const nameALast = fullNameA.split(" ").pop()!
                  const nameBLast = fullNameB.split(" ").pop()!
                  const visible = showAllCircuits ? advantages : advantages.slice(0, 6)
                  return (
                    <div className="space-y-2">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                        {visible.map((adv) => {
                          const isWinnerA = adv.winner === fullNameA
                          const winnerColor = isWinnerA ? colorA : colorB
                          const wins = adv.races.filter((r) => isWinnerA ? r.posA < r.posB : r.posB < r.posA).length
                          const total = adv.races.length
                          const winnerLast = isWinnerA ? nameALast : nameBLast
                          const barA = Math.max(5, ((20 - adv.posA) / 19) * 100)
                          const barB = Math.max(5, ((20 - adv.posB) / 19) * 100)
                          return (
                            <div key={adv.circuit} className="bg-white rounded-xl border border-gray-100 shadow-sm p-2.5 space-y-1.5">
                              <div className="flex items-start justify-between gap-2">
                                <p className="font-semibold text-gray-900 text-sm">{adv.circuit}</p>
                                <span className="text-xs font-semibold shrink-0" style={{ color: winnerColor }}>
                                  {winnerLast} domina ({wins} de {total})
                                </span>
                              </div>
                              <div className="space-y-1.5">
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-16 shrink-0 truncate">{nameALast}</span>
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${barA}%`, backgroundColor: colorA }} />
                                  </div>
                                  <span className="text-xs text-gray-400 w-16 text-right shrink-0">{avgPositionToLabel(adv.posA)}</span>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span className="text-xs text-gray-500 w-16 shrink-0 truncate">{nameBLast}</span>
                                  <div className="flex-1 h-2 bg-gray-100 rounded-full overflow-hidden">
                                    <div className="h-full rounded-full" style={{ width: `${barB}%`, backgroundColor: colorB }} />
                                  </div>
                                  <span className="text-xs text-gray-400 w-16 text-right shrink-0">{avgPositionToLabel(adv.posB)}</span>
                                </div>
                              </div>
                              <button
                                onClick={() => setExpandedCircuit(expandedCircuit === adv.circuit ? null : adv.circuit)}
                                className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors"
                              >
                                {expandedCircuit === adv.circuit ? "Ocultar ↑" : "Ver detalle ↓"}
                              </button>
                              {expandedCircuit === adv.circuit && (
                                <div className="border-t border-gray-50 pt-2">
                                  <table className="w-full text-xs">
                                    <thead>
                                      <tr>
                                        <th className="text-left font-medium text-gray-400 pb-1">Año</th>
                                        <th className="text-center font-medium text-gray-400 pb-1">{nameALast}</th>
                                        <th className="text-center font-medium text-gray-400 pb-1">{nameBLast}</th>
                                      </tr>
                                    </thead>
                                    <tbody>
                                      {adv.races.map((race) => (
                                        <tr key={race.year} className="border-t border-gray-50">
                                          <td className="py-1 text-gray-500">{race.year}</td>
                                          <td className={`py-1 text-center ${race.posA < race.posB ? "font-bold text-gray-900" : "text-gray-400"}`}>
                                            P{race.posA}
                                          </td>
                                          <td className={`py-1 text-center ${race.posB < race.posA ? "font-bold text-gray-900" : "text-gray-400"}`}>
                                            P{race.posB}
                                          </td>
                                        </tr>
                                      ))}
                                    </tbody>
                                  </table>
                                </div>
                              )}
                            </div>
                          )
                        })}
                      </div>
                      {advantages.length > 6 && (
                        <button
                          onClick={() => setShowAllCircuits((v) => !v)}
                          className="text-xs text-indigo-600 font-medium hover:text-indigo-800 transition-colors flex items-center gap-1"
                        >
                          {showAllCircuits ? "Ocultar circuitos ↑" : `Ver todos los circuitos (${advantages.length}) ↓`}
                        </button>
                      )}
                      {usedHistorical && (
                        <p className="text-xs text-gray-400">Basado en histórico disponible</p>
                      )}
                    </div>
                  )
                })()}
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <p className="font-semibold text-gray-900 text-sm">{fullNameA}</p>
                  <RaceEvolutionChart results={dataA.results} />
                </div>
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm p-5 space-y-3">
                  <p className="font-semibold text-gray-900 text-sm">{fullNameB}</p>
                  <RaceEvolutionChart results={dataB.results} />
                </div>
              </div>
            </div>
          )}

          {(!driverA || !driverB) && !loading && (
            <div className="text-center py-12 text-gray-400">
              <p>Seleccioná dos pilotos para comenzar la comparación.</p>
            </div>
          )}

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
    <div className="max-w-5xl mx-auto px-4 py-6 space-y-6">
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
