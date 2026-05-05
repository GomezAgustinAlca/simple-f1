"use client"

import type { DriverPerformanceSummary } from "@/types/f1"

interface Props {
  nameA: string
  nameB: string
  summaryA: DriverPerformanceSummary
  summaryB: DriverPerformanceSummary
}

interface Decision {
  winner: "A" | "B" | null
  winnerName: string | null
  reasons: string[]
  risk: string | null
}

interface ScoredDimension {
  score: number
  label: string
  valueA: number
  valueB: number
}

function formatComparisonLabel(label: string, winnerValue: number, loserValue: number): string | null {
  if (label === "Rendimiento reciente") {
    return `Terminó cerca del P${Math.round(winnerValue)} vs P${Math.round(loserValue)} en las últimas carreras`
  }
  if (label === "Abandonos") {
    if (winnerValue === 0) {
      return `No abandonó esta temporada vs ${loserValue} abandono${loserValue !== 1 ? "s" : ""} del rival`
    }
    return `${winnerValue} abandono${winnerValue !== 1 ? "s" : ""} vs ${loserValue} del rival esta temporada`
  }
  if (label === "Consistencia") {
    return `Resultados más estables: varió ${Math.round(winnerValue)} posiciones vs ${Math.round(loserValue)}`
  }
  if (label === "Puntos") {
    return `${Math.round(winnerValue)} puntos vs ${Math.round(loserValue)} del rival en la temporada`
  }
  return null
}

function getDecision(
  nameA: string,
  nameB: string,
  summaryA: DriverPerformanceSummary,
  summaryB: DriverPerformanceSummary
): Decision {
  const dims: ScoredDimension[] = []

  // 1. Rendimiento reciente — máxima prioridad
  const recentA = summaryA.lastFiveAveragePosition
  const recentB = summaryB.lastFiveAveragePosition
  let addedRecentDim = false
  if (recentA != null && recentB != null && Math.abs(recentA - recentB) >= 0.5) {
    dims.push({
      score: recentA < recentB ? 1 : -1,
      label: "Rendimiento reciente",
      valueA: recentA,
      valueB: recentB,
    })
    addedRecentDim = true
  }

  // 2. Consistencia: variación entre mejor y peor resultado (mínimo 3 carreras)
  const bestA = summaryA.bestFinish
  const worstA = summaryA.worstFinish
  const bestB = summaryB.bestFinish
  const worstB = summaryB.worstFinish
  if (
    bestA != null && worstA != null && bestB != null && worstB != null &&
    summaryA.racesCount >= 3 && summaryB.racesCount >= 3
  ) {
    const spreadA = worstA - bestA
    const spreadB = worstB - bestB
    if (Math.abs(spreadA - spreadB) >= 3) {
      dims.push({
        score: spreadA < spreadB ? 1 : -1,
        label: "Consistencia",
        valueA: spreadA,
        valueB: spreadB,
      })
    }
  }

  // 3. DNFs
  if (summaryA.dnfs !== summaryB.dnfs) {
    dims.push({
      score: summaryA.dnfs < summaryB.dnfs ? 1 : -1,
      label: "Abandonos",
      valueA: summaryA.dnfs,
      valueB: summaryB.dnfs,
    })
  }

  // 4. Puntos totales — solo si hay diferencia clara y el rendimiento reciente no lo captura
  const ptsDiff = Math.abs(summaryA.totalPoints - summaryB.totalPoints)
  if (!addedRecentDim && ptsDiff >= 10) {
    dims.push({
      score: summaryA.totalPoints > summaryB.totalPoints ? 1 : -1,
      label: "Puntos",
      valueA: summaryA.totalPoints,
      valueB: summaryB.totalPoints,
    })
  }

  const total = dims.reduce((s, d) => s + d.score, 0)

  if (dims.length === 0 || (Math.abs(total) <= 1 && dims.length >= 2)) {
    return { winner: null, winnerName: null, reasons: [], risk: null }
  }

  const side: "A" | "B" = total >= 0 ? "A" : "B"
  const winnerName = side === "A" ? nameA : nameB
  const winnerSummary = side === "A" ? summaryA : summaryB

  const winnerValueKey = side === "A" ? "valueA" : "valueB"
  const loserValueKey = side === "A" ? "valueB" : "valueA"
  const reasons = dims
    .filter((d) => (side === "A" ? d.score > 0 : d.score < 0))
    .map((d) => formatComparisonLabel(d.label, d[winnerValueKey], d[loserValueKey]))
    .filter((r): r is string => r !== null)
    .slice(0, 2)

  let risk: string | null = null
  const dnfRate = winnerSummary.racesCount > 0 ? winnerSummary.dnfs / winnerSummary.racesCount : 0
  if (winnerSummary.trend === "DOWN") {
    risk = "forma en caída en las últimas carreras"
  } else if (dnfRate >= 0.3 && winnerSummary.dnfs >= 2) {
    risk = `${winnerSummary.dnfs} abandonos esta temporada`
  }

  return { winner: side, winnerName, reasons, risk }
}

export function CompareDecisionBlock({ nameA, nameB, summaryA, summaryB }: Props) {
  const decision = getDecision(nameA, nameB, summaryA, summaryB)

  if (decision.winner === null) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-3">
        <p className="text-xl font-semibold text-gray-700">
          Comparación pareja con datos actuales
        </p>
      </div>
    )
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-3 shadow-sm">
      <p className="text-2xl font-bold text-indigo-900">
        Si corren hoy, {decision.winnerName} tiene más chances de terminar adelante
      </p>
      {decision.reasons.length > 0 && (
        <ul className="space-y-1.5">
          {decision.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
              {r}
            </li>
          ))}
        </ul>
      )}
      {decision.risk && (
        <p className="text-xs text-amber-700 bg-amber-50 border border-amber-100 rounded-xl px-3 py-2">
          Riesgo: {decision.risk}
        </p>
      )}
    </div>
  )
}
