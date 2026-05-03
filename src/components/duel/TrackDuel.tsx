"use client"

import { useState, useEffect, useLayoutEffect, useRef } from "react"
import type { DriverStanding } from "@/types/f1"
import { CIRCUITS, getTeamColor } from "./circuitData"
import { CircuitSVG } from "./CircuitSVG"
import { DuelSummary } from "./DuelSummary"

interface CircuitStats {
  driverId: string
  bestPosition: number | null
  averagePosition: number | null
  lastPosition: number | null
  lastSeason: number | null
  hasData: boolean
  results: Array<{ season: number; position: number | null; positionText: string; status: string }>
}

type Phase = "idle" | "loading" | "ready" | "racing" | "paused" | "finished"

interface TooltipData {
  keypointName: string
  keypointIndex: number
}

const KEYPOINT_PERCENTS = [0.25, 0.5, 0.75]
const RACE_DURATION_SECS = 9

export function TrackDuel({ drivers }: { drivers: DriverStanding[] }) {
  const [driverA, setDriverA] = useState("")
  const [driverB, setDriverB] = useState("")
  const [circuitId, setCircuitId] = useState("")
  const [statsA, setStatsA] = useState<CircuitStats | null>(null)
  const [statsB, setStatsB] = useState<CircuitStats | null>(null)
  const [phase, setPhase] = useState<Phase>("idle")
  const [tooltip, setTooltip] = useState<TooltipData | null>(null)
  const [passedKeypoints, setPassedKeypoints] = useState(0)
  const [error, setError] = useState("")

  // DOM refs
  const svgRef = useRef<SVGSVGElement>(null)
  const pathRef = useRef<SVGPathElement>(null)
  const carARef = useRef<SVGGElement>(null)
  const carBRef = useRef<SVGGElement>(null)
  const photoARef = useRef<SVGGElement>(null)
  const photoBRef = useRef<SVGGElement>(null)

  // Animation state refs (mutated only in handlers/effects)
  const rafRef = useRef<number>(0)
  const isRunningRef = useRef(false)
  const progressARef = useRef(0)
  const progressBRef = useRef(0)
  const lastTimestampRef = useRef<number>(0)
  const passedKeypointsRef = useRef(0)
  const speedARef = useRef(1)
  const speedBRef = useRef(1)
  const circuitIdRef = useRef(circuitId)
  // Loop and pause stored in refs, updated in useLayoutEffect
  const loopRef = useRef<(ts: number) => void>(() => {})
  const pauseRef = useRef<(idx: number) => void>(() => {})

  // Keep circuitIdRef in sync
  useEffect(() => {
    circuitIdRef.current = circuitId
  }, [circuitId])

  // Update pause function ref after each render (latest closure)
  useLayoutEffect(() => {
    pauseRef.current = (idx: number) => {
      isRunningRef.current = false
      cancelAnimationFrame(rafRef.current)
      setPassedKeypoints(idx + 1)
      passedKeypointsRef.current = idx + 1
      const circ = CIRCUITS.find(c => c.id === circuitIdRef.current)
      if (circ) {
        setTooltip({ keypointName: circ.keypoints[idx].name, keypointIndex: idx })
      }
      setPhase("paused")
    }
  })

  // Update animation loop ref after each render (latest closure)
  useLayoutEffect(() => {
    loopRef.current = (timestamp: number) => {
      if (!isRunningRef.current) return
      const path = pathRef.current
      const carA = carARef.current
      const carB = carBRef.current
      if (!path || !carA || !carB) return

      const dt = lastTimestampRef.current ? (timestamp - lastTimestampRef.current) / 1000 : 0
      lastTimestampRef.current = timestamp

      progressARef.current = Math.min(progressARef.current + (dt * speedARef.current) / RACE_DURATION_SECS, 1)
      progressBRef.current = Math.min(progressBRef.current + (dt * speedBRef.current) / RACE_DURATION_SECS, 1)

      // Position car and photo along path; photo uses translate only (no rotation)
      const positionCar = (
        group: SVGGElement,
        photoGroup: SVGGElement | null,
        progress: number,
        offsetSign: number
      ) => {
        const length = path.getTotalLength()
        const p = Math.min(progress, 1)
        const pos = path.getPointAtLength(p * length)
        const pos2 = path.getPointAtLength(Math.min((p + 0.002) * length, length))
        const angle = Math.atan2(pos2.y - pos.y, pos2.x - pos.x) * (180 / Math.PI)
        const perpAngle = Math.atan2(pos2.y - pos.y, pos2.x - pos.x) + Math.PI / 2
        const ox = Math.cos(perpAngle) * 18 * offsetSign
        const oy = Math.sin(perpAngle) * 18 * offsetSign
        const tx = pos.x + ox
        const ty = pos.y + oy
        group.setAttribute("transform", `translate(${tx}, ${ty}) rotate(${angle})`)
        group.style.opacity = "1"
        if (photoGroup) {
          photoGroup.setAttribute("transform", `translate(${tx}, ${ty - 26})`)
          photoGroup.style.opacity = "1"
        }
      }

      positionCar(carA, photoARef.current, progressARef.current, 1)
      positionCar(carB, photoBRef.current, progressBRef.current, -1)

      const nextKpIdx = passedKeypointsRef.current
      if (nextKpIdx < KEYPOINT_PERCENTS.length) {
        const threshold = KEYPOINT_PERCENTS[nextKpIdx]
        if (progressARef.current >= threshold || progressBRef.current >= threshold) {
          pauseRef.current(nextKpIdx)
          return
        }
      }

      if (progressARef.current >= 1 && progressBRef.current >= 1) {
        isRunningRef.current = false
        setPhase("finished")
        return
      }

      rafRef.current = requestAnimationFrame((ts) => loopRef.current(ts))
    }
  })

  function startAnimation() {
    isRunningRef.current = true
    lastTimestampRef.current = 0
    setPhase("racing")
    rafRef.current = requestAnimationFrame((ts) => loopRef.current(ts))
  }

  function resumeAnimation() {
    setTooltip(null)
    setPhase("racing")
    isRunningRef.current = true
    lastTimestampRef.current = 0
    rafRef.current = requestAnimationFrame((ts) => loopRef.current(ts))
  }

  function resetDuel() {
    cancelAnimationFrame(rafRef.current)
    isRunningRef.current = false
    progressARef.current = 0
    progressBRef.current = 0
    passedKeypointsRef.current = 0
    setPassedKeypoints(0)
    setTooltip(null)
    setPhase("ready")
    setStatsA(null)
    setStatsB(null)
    if (carARef.current) carARef.current.style.opacity = "0"
    if (carBRef.current) carBRef.current.style.opacity = "0"
    if (photoARef.current) photoARef.current.style.opacity = "0"
    if (photoBRef.current) photoBRef.current.style.opacity = "0"
  }

  useEffect(() => {
    return () => { cancelAnimationFrame(rafRef.current) }
  }, [])

  useEffect(() => {
    progressARef.current = 0
    progressBRef.current = 0
    passedKeypointsRef.current = 0
    if (carARef.current) carARef.current.style.opacity = "0"
    if (carBRef.current) carBRef.current.style.opacity = "0"
    if (photoARef.current) photoARef.current.style.opacity = "0"
    if (photoBRef.current) photoBRef.current.style.opacity = "0"
  }, [circuitId])

  async function handleStartDuel() {
    if (!driverA || !driverB || !circuitId) return
    setError("")
    setPhase("loading")
    setStatsA(null)
    setStatsB(null)
    progressARef.current = 0
    progressBRef.current = 0
    passedKeypointsRef.current = 0
    setPassedKeypoints(0)
    setTooltip(null)

    try {
      const res = await fetch(`/api/circuit-duel?driverA=${driverA}&driverB=${driverB}&circuitId=${circuitId}`)
      const data = await res.json()
      const sA: CircuitStats = data.driverA
      const sB: CircuitStats = data.driverB
      setStatsA(sA)
      setStatsB(sB)

      const avgA = sA.averagePosition
      const avgB = sB.averagePosition
      if (avgA !== null && avgB !== null && Math.abs(avgA - avgB) > 0.5) {
        const diff = Math.min(Math.abs(avgA - avgB), 8)
        const advantage = (diff / 8) * 0.15
        speedARef.current = avgA < avgB ? 1 + advantage : 1
        speedBRef.current = avgB < avgA ? 1 + advantage : 1
      } else {
        speedARef.current = 1
        speedBRef.current = 1
      }

      setPhase("ready")
    } catch {
      setError("Error cargando datos históricos. Intentá de nuevo.")
      setPhase("idle")
    }
  }

  const circuit = CIRCUITS.find(c => c.id === circuitId)
  const standingA = drivers.find(d => d.driverId === driverA)
  const standingB = drivers.find(d => d.driverId === driverB)
  const colorA = standingA ? getTeamColor(standingA.constructorName.toLowerCase().replace(/ /g, "_")) : "#6B7280"
  const colorB = standingB ? getTeamColor(standingB.constructorName.toLowerCase().replace(/ /g, "_")) : "#374151"
  const nameA = standingA ? `${standingA.givenName} ${standingA.familyName}` : driverA
  const nameB = standingB ? `${standingB.givenName} ${standingB.familyName}` : driverB
  const canStart = driverA && driverB && circuitId && driverA !== driverB
  const getInitials = (name: string) =>
    name.split(" ").map(n => n[0] ?? "").join("").slice(0, 3).toUpperCase()
  const initialsA = standingA ? getInitials(`${standingA.givenName} ${standingA.familyName}`) : "?"
  const initialsB = standingB ? getInitials(`${standingB.givenName} ${standingB.familyName}`) : "?"

  return (
    <div className="space-y-6">
      {/* Selectors */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Piloto A</label>
          <select
            value={driverA}
            onChange={e => { setDriverA(e.target.value); setPhase("idle") }}
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
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Circuito</label>
          <select
            value={circuitId}
            onChange={e => { setCircuitId(e.target.value); setPhase("idle") }}
            className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm text-gray-800 focus:outline-none focus:ring-2 focus:ring-indigo-500"
          >
            <option value="">Seleccionar circuito...</option>
            {CIRCUITS.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Piloto B</label>
          <select
            value={driverB}
            onChange={e => { setDriverB(e.target.value); setPhase("idle") }}
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

      {(phase === "idle" || phase === "ready") && (
        <button
          onClick={handleStartDuel}
          disabled={!canStart}
          className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-sm bg-indigo-600 hover:bg-indigo-700 text-white transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
        >
          Iniciar duelo
        </button>
      )}

      {phase === "loading" && (
        <p className="text-sm text-gray-400 animate-pulse">Cargando datos históricos...</p>
      )}

      {error && (
        <div className="bg-red-50 border border-red-100 rounded-xl p-4 text-red-600 text-sm">{error}</div>
      )}

      {/* Circuit track + animation */}
      {circuit && (phase === "ready" || phase === "racing" || phase === "paused" || phase === "finished") && (
        <div className="space-y-4">
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="font-bold text-gray-900">{circuit.name}</h3>
            <div className="flex items-center gap-4 text-xs font-semibold">
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colorA }} />
                {nameA.split(" ").pop()} (A)
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-full inline-block" style={{ backgroundColor: colorB }} />
                {nameB.split(" ").pop()} (B)
              </span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl">
          <div className="relative bg-gray-50 rounded-2xl border border-gray-100 p-4">
            <CircuitSVG
              ref={svgRef}
              circuit={circuit}
              carAColor={colorA}
              carBColor={colorB}
              carARef={carARef}
              carBRef={carBRef}
              pathRef={pathRef}
              photoARef={photoARef}
              photoBRef={photoBRef}
              driverAId={driverA}
              driverBId={driverB}
              driverAInitials={initialsA}
              driverBInitials={initialsB}
            />

            {phase === "ready" && (
              <div className="absolute inset-0 flex items-center justify-center rounded-2xl bg-white/70 backdrop-blur-sm">
                <button
                  onClick={startAnimation}
                  className="px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors shadow-lg"
                >
                  ▶ Iniciar duelo
                </button>
              </div>
            )}

            {phase === "paused" && tooltip && statsA && statsB && (
              <div className="absolute inset-0 flex items-center justify-center p-4 rounded-2xl bg-white/80 backdrop-blur-sm">
                <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-5 w-full max-w-sm space-y-4">
                  <div className="flex items-center justify-between">
                    <p className="font-black text-gray-900 text-sm">{tooltip.keypointName}</p>
                    <span className="text-xs text-amber-600 font-bold bg-amber-50 px-2 py-0.5 rounded-full">
                      Punto {tooltip.keypointIndex + 1}/3
                    </span>
                  </div>

                  <div className="grid grid-cols-3 gap-2 text-xs">
                    <div />
                    <div
                      className="text-center font-bold py-1 px-1 rounded-lg"
                      style={{ backgroundColor: colorA + "22", color: colorA }}
                    >
                      {nameA.split(" ").pop()}
                    </div>
                    <div
                      className="text-center font-bold py-1 px-1 rounded-lg"
                      style={{ backgroundColor: colorB + "22", color: colorB }}
                    >
                      {nameB.split(" ").pop()}
                    </div>

                    <div className="text-gray-500 self-center">Mejor</div>
                    <div className="text-center font-semibold text-gray-900">
                      {statsA.bestPosition !== null ? `P${statsA.bestPosition}` : "—"}
                    </div>
                    <div className="text-center font-semibold text-gray-900">
                      {statsB.bestPosition !== null ? `P${statsB.bestPosition}` : "—"}
                    </div>

                    <div className="text-gray-500 self-center">Promedio</div>
                    <div className="text-center font-semibold text-gray-900">
                      {statsA.averagePosition !== null ? `P${statsA.averagePosition}` : "—"}
                    </div>
                    <div className="text-center font-semibold text-gray-900">
                      {statsB.averagePosition !== null ? `P${statsB.averagePosition}` : "—"}
                    </div>

                    <div className="text-gray-500 self-center">Última</div>
                    <div className="text-center font-semibold text-gray-900">
                      {statsA.lastPosition !== null ? `P${statsA.lastPosition}` : "—"}
                      {statsA.lastSeason && <span className="text-gray-400"> ({statsA.lastSeason})</span>}
                    </div>
                    <div className="text-center font-semibold text-gray-900">
                      {statsB.lastPosition !== null ? `P${statsB.lastPosition}` : "—"}
                      {statsB.lastSeason && <span className="text-gray-400"> ({statsB.lastSeason})</span>}
                    </div>
                  </div>

                  <button
                    onClick={resumeAnimation}
                    className="w-full py-2 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white font-bold text-sm transition-colors"
                  >
                    Continuar →
                  </button>
                </div>
              </div>
            )}
          </div>
          </div>

          {(phase === "racing" || phase === "paused") && (
            <div className="space-y-1">
              <div className="flex justify-between text-xs text-gray-400">
                <span>Largada</span>
                <span>Meta</span>
              </div>
              <div className="relative h-2 bg-gray-100 rounded-full">
                {KEYPOINT_PERCENTS.map((p, i) => (
                  <div
                    key={i}
                    className="absolute top-0 w-0.5 h-2 rounded-full"
                    style={{
                      left: `${p * 100}%`,
                      backgroundColor: passedKeypoints > i ? "#f59e0b" : "#d1d5db",
                    }}
                  />
                ))}
              </div>
            </div>
          )}

          <p className="text-xs text-gray-400 text-center">
            La animación representa rendimiento histórico general en base a posiciones finales. No refleja velocidad real por sector ni telemetría.
          </p>
        </div>
      )}

      {phase === "finished" && statsA && statsB && (
        <DuelSummary
          nameA={nameA}
          nameB={nameB}
          colorA={colorA}
          colorB={colorB}
          avgA={statsA.averagePosition}
          avgB={statsB.averagePosition}
          bestA={statsA.bestPosition}
          bestB={statsB.bestPosition}
          lastA={statsA.lastPosition}
          lastB={statsB.lastPosition}
          validRacesA={statsA.results.filter(r => r.position !== null).length}
          validRacesB={statsB.results.filter(r => r.position !== null).length}
          onReset={resetDuel}
        />
      )}
    </div>
  )
}
