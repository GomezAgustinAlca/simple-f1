"use client"

import { avgPositionToLabel } from "@/lib/performance"
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
  reasonA: string
  reasonB: string
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
      reasonA: `Mejor rendimiento reciente: ${avgPositionToLabel(recentA)} vs ${avgPositionToLabel(recentB)}`,
      reasonB: `Mejor rendimiento reciente: ${avgPositionToLabel(recentB)} vs ${avgPositionToLabel(recentA)}`,
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
        reasonA: `Menor variación de resultados: ${spreadA} posiciones vs ${spreadB} (más consistente)`,
        reasonB: `Menor variación de resultados: ${spreadB} posiciones vs ${spreadA} (más consistente)`,
      })
    }
  }

  // 3. DNFs
  if (summaryA.dnfs !== summaryB.dnfs) {
    dims.push({
      score: summaryA.dnfs < summaryB.dnfs ? 1 : -1,
      reasonA: `Menos abandonos: ${summaryA.dnfs} vs ${summaryB.dnfs}`,
      reasonB: `Menos abandonos: ${summaryB.dnfs} vs ${summaryA.dnfs}`,
    })
  }

  // 4. Puntos totales — solo si hay diferencia clara y el rendimiento reciente no lo captura
  const ptsDiff = Math.abs(summaryA.totalPoints - summaryB.totalPoints)
  if (!addedRecentDim && ptsDiff >= 10) {
    dims.push({
      score: summaryA.totalPoints > summaryB.totalPoints ? 1 : -1,
      reasonA: `Mayor acumulado de puntos: ${summaryA.totalPoints} vs ${summaryB.totalPoints}`,
      reasonB: `Mayor acumulado de puntos: ${summaryB.totalPoints} vs ${summaryA.totalPoints}`,
    })
  }

  const total = dims.reduce((s, d) => s + d.score, 0)

  if (dims.length === 0 || (Math.abs(total) <= 1 && dims.length >= 2)) {
    return { winner: null, winnerName: null, reasons: [], risk: null }
  }

  const side: "A" | "B" = total >= 0 ? "A" : "B"
  const winnerName = side === "A" ? nameA : nameB
  const winnerSummary = side === "A" ? summaryA : summaryB

  const reasons = dims
    .filter((d) => (side === "A" ? d.score > 0 : d.score < 0))
    .map((d) => (side === "A" ? d.reasonA : d.reasonB))
    .slice(0, 3)

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
      <div className="bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4">
        <p className="text-sm font-semibold text-gray-700">Comparación pareja con datos actuales</p>
        <p className="text-xs text-gray-400 mt-0.5">
          Los datos disponibles no muestran una ventaja clara entre los dos pilotos.
        </p>
      </div>
    )
  }

  return (
    <div className="bg-white border border-indigo-100 rounded-2xl px-5 py-4 space-y-3 shadow-sm">
      <p className="text-sm font-bold text-indigo-800">
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
