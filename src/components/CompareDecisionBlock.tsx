"use client"

import type { DriverPerformanceSummary } from "@/types/f1"

interface Props {
  nameA: string
  nameB: string
  summaryA: DriverPerformanceSummary
  summaryB: DriverPerformanceSummary
}

interface ReasonItem {
  text: string
  label: string
}

interface Decision {
  winner: "A" | "B" | null
  winnerName: string | null
  reasons: ReasonItem[]
  risk: string | null
  riskIsDnf: boolean
}

interface ScoredDimension {
  score: number
  label: string
  valueA: number
  valueB: number
}

function formatComparisonLabel(label: string, nameA: string, nameB: string, valueA: number, valueB: number): string | null {
  if (label === "Rendimiento reciente") {
    return `${nameA} viene terminando cerca del P${Math.round(valueA)}; ${nameB} cerca del P${Math.round(valueB)}`
  }
  if (label === "Abandonos") {
    if (valueA === 0 && valueB > 0) {
      return `${nameA} no abandonó esta temporada; ${nameB} abandonó ${valueB} vez${valueB !== 1 ? "es" : ""}`
    }
    if (valueB === 0 && valueA > 0) {
      return `${nameA} abandonó ${valueA} vez${valueA !== 1 ? "es" : ""}; ${nameB} no abandonó esta temporada`
    }
    return `${nameA}: ${valueA} abandon${valueA !== 1 ? "os" : "o"}; ${nameB}: ${valueB}`
  }
  if (label === "Puntos") {
    return `${nameA}: ${Math.round(valueA)} pts; ${nameB}: ${Math.round(valueB)} en la temporada`
  }
  if (label === "Mejor resultado") {
    const betterName = valueA < valueB ? nameA : nameB
    const worseName = valueA < valueB ? nameB : nameA
    return `${betterName} llegó al P${Math.min(valueA, valueB)} como mejor resultado; ${worseName} al P${Math.max(valueA, valueB)}`
  }
  return null
}


function getRecentTier(avgPos: number): string {
  if (avgPos <= 3) return "top3"
  if (avgPos <= 5) return "top5"
  if (avgPos <= 10) return "top10"
  return "back"
}

function getDecision(
  nameA: string,
  nameB: string,
  summaryA: DriverPerformanceSummary,
  summaryB: DriverPerformanceSummary
): Decision {
  const ptsDiff = Math.abs(summaryA.totalPoints - summaryB.totalPoints)
  const recentA = summaryA.lastFiveAveragePosition
  const recentB = summaryB.lastFiveAveragePosition

  // Strict tie: all three conditions must hold
  const sameRecentTier =
    recentA != null && recentB != null &&
    getRecentTier(recentA) === getRecentTier(recentB)
  const bestDiff =
    summaryA.bestFinish != null && summaryB.bestFinish != null
      ? Math.abs(summaryA.bestFinish - summaryB.bestFinish)
      : null
  const isTie =
    ptsDiff <= 10 &&
    sameRecentTier &&
    (bestDiff == null || bestDiff <= 2)

  if (isTie) {
    return { winner: null, winnerName: null, reasons: [], risk: null, riskIsDnf: false }
  }

  // Build dims in priority order: puntos → reciente → mejor resultado → abandonos
  const dims: ScoredDimension[] = []

  // 1. Puntos
  if (ptsDiff >= 5) {
    dims.push({
      score: summaryA.totalPoints > summaryB.totalPoints ? 1 : -1,
      label: "Puntos",
      valueA: summaryA.totalPoints,
      valueB: summaryB.totalPoints,
    })
  }

  // 2. Rendimiento reciente
  if (recentA != null && recentB != null && Math.abs(recentA - recentB) >= 0.5) {
    dims.push({
      score: recentA < recentB ? 1 : -1,
      label: "Rendimiento reciente",
      valueA: recentA,
      valueB: recentB,
    })
  }

  // 3. Mejor resultado
  const bestA = summaryA.bestFinish
  const bestB = summaryB.bestFinish
  if (bestA != null && bestB != null && Math.abs(bestA - bestB) >= 1) {
    dims.push({
      score: bestA < bestB ? 1 : -1,
      label: "Mejor resultado",
      valueA: bestA,
      valueB: bestB,
    })
  }

  // 4. Abandonos
  if (summaryA.dnfs !== summaryB.dnfs) {
    dims.push({
      score: summaryA.dnfs < summaryB.dnfs ? 1 : -1,
      label: "Abandonos",
      valueA: summaryA.dnfs,
      valueB: summaryB.dnfs,
    })
  }

  if (dims.length === 0) {
    return { winner: null, winnerName: null, reasons: [], risk: null, riskIsDnf: false }
  }

  // Winner by total score; first dim (highest priority) breaks ties
  const total = dims.reduce((s, d) => s + d.score, 0)
  const decidingScore = total !== 0 ? total : dims[0].score
  const side: "A" | "B" = decidingScore > 0 ? "A" : "B"
  const winnerName = side === "A" ? nameA : nameB
  const winnerSummary = side === "A" ? summaryA : summaryB

  const reasons: ReasonItem[] = dims
    .filter((d) => (side === "A" ? d.score > 0 : d.score < 0))
    .map((d) => ({
      text: formatComparisonLabel(d.label, nameA, nameB, d.valueA, d.valueB) ?? "",
      label: d.label,
    }))
    .filter((r) => r.text !== "")
    .slice(0, 2)

  let risk: string | null = null
  let riskIsDnf = false
  const dnfRate = winnerSummary.racesCount > 0 ? winnerSummary.dnfs / winnerSummary.racesCount : 0
  if (winnerSummary.trend === "DOWN") {
    risk = "forma en caída en las últimas carreras"
  } else if (dnfRate >= 0.3 && winnerSummary.dnfs >= 2) {
    risk = `${winnerSummary.dnfs} abandonos esta temporada`
    riskIsDnf = true
  }

  return { winner: side, winnerName, reasons, risk, riskIsDnf }
}

export function CompareDecisionBlock({ nameA, nameB, summaryA, summaryB }: Props) {
  const rawDecision = getDecision(nameA, nameB, summaryA, summaryB)

  const decision = {
    ...rawDecision,
    reasons: rawDecision.reasons.map((r) => {
      if (r.label !== "Abandonos") return r
      const xA = summaryA.dnfs
      const xB = summaryB.dnfs
      const timesA = `${xA} vez${xA !== 1 ? "es" : ""}`
      const timesB = `${xB} vez${xB !== 1 ? "es" : ""}`
      let text: string
      if (xA === 0) {
        text = `${nameB} abandonó ${timesB} esta temporada`
      } else if (xB === 0) {
        text = `${nameA} abandonó ${timesA} esta temporada`
      } else {
        text = `${nameA} abandonó ${timesA}; ${nameB} ${timesB}`
      }
      return { ...r, text }
    }),
    risk: rawDecision.riskIsDnf && rawDecision.risk !== null
      ? (() => {
          const winnerName = rawDecision.winner === "A" ? nameA : nameB
          const winnerDnfs = rawDecision.winner === "A" ? summaryA.dnfs : summaryB.dnfs
          const loserDnfs = rawDecision.winner === "A" ? summaryB.dnfs : summaryA.dnfs
          if (winnerDnfs > loserDnfs) {
            return `${winnerName} rinde mejor, aunque abandonó más veces: ${winnerDnfs} vs ${loserDnfs}`
          }
          const times = `${winnerDnfs} vez${winnerDnfs !== 1 ? "es" : ""}`
          return `${winnerName} abandonó ${times} esta temporada`
        })()
      : rawDecision.risk,
  }

  if (decision.winner === null) {
    const insufficientData = summaryA.racesCount < 2 || summaryB.racesCount < 2

    if (insufficientData) {
      const bullets: string[] = ["Pocas carreras disputadas"]
      if (summaryA.trend === "INSUFFICIENT_DATA" || summaryB.trend === "INSUFFICIENT_DATA") {
        bullets.push("Todavía no hay una tendencia clara")
      }
      return (
        <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
          <p className="text-base font-semibold text-gray-600">
            Todavía no hay suficiente información para comparar con confianza
          </p>
          <ul className="space-y-1">
            {bullets.map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-gray-300 mt-0.5 shrink-0">•</span>
                {b}
              </li>
            ))}
          </ul>
        </div>
      )
    }

    // Ambos tienen datos suficientes pero la comparación está pareja
    const lastA = nameA.split(" ").pop()!
    const lastB = nameB.split(" ").pop()!
    const tiedBullets: string[] = []

    const ptsDiff = Math.abs(summaryA.totalPoints - summaryB.totalPoints)
    if (summaryA.totalPoints === summaryB.totalPoints && summaryA.totalPoints > 0) {
      tiedBullets.push(`Ambos tienen ${summaryA.totalPoints} puntos`)
    } else if (ptsDiff <= 5 && summaryA.totalPoints > 0 && summaryB.totalPoints > 0) {
      const moreName = summaryA.totalPoints > summaryB.totalPoints ? lastA : lastB
      tiedBullets.push(`${moreName} lleva ${ptsDiff} punto${ptsDiff !== 1 ? "s" : ""} más`)
    } else if (summaryA.lastFiveAveragePosition != null && summaryB.lastFiveAveragePosition != null) {
      const avgPos = Math.round((summaryA.lastFiveAveragePosition + summaryB.lastFiveAveragePosition) / 2)
      tiedBullets.push(`Ambos terminan cerca del P${avgPos} esta temporada`)
    }

    const secDiffs: string[] = []
    if (summaryA.bestFinish != null && summaryB.bestFinish != null && summaryA.bestFinish !== summaryB.bestFinish) {
      const betterName = summaryA.bestFinish < summaryB.bestFinish ? lastA : lastB
      secDiffs.push(`${betterName} tiene mejor resultado máximo`)
    }
    if (summaryA.dnfs !== summaryB.dnfs) {
      const fewerName = summaryA.dnfs < summaryB.dnfs ? lastA : lastB
      secDiffs.push(`${fewerName} abandonó menos`)
    }
    if (secDiffs.length > 0) tiedBullets.push(secDiffs.join("; "))

    return (
      <div className="bg-gray-50 border border-gray-200 rounded-xl p-5 space-y-2">
        <p className="text-base font-semibold text-gray-600">
          Comparación muy pareja esta temporada
        </p>
        {tiedBullets.length > 0 && (
          <ul className="space-y-1">
            {tiedBullets.slice(0, 2).map((b, i) => (
              <li key={i} className="flex items-start gap-2 text-xs text-gray-500">
                <span className="text-gray-300 mt-0.5 shrink-0">•</span>
                {b}
              </li>
            ))}
          </ul>
        )}
      </div>
    )
  }

  return (
    <div className="bg-indigo-50 border border-indigo-200 rounded-xl p-6 space-y-3 shadow-sm">
      <p className="text-2xl font-bold text-indigo-900">
        Si corren hoy, {decision.winnerName} tiene más chances de terminar adelante
      </p>
      {(decision.reasons.length > 0 || decision.risk) && (
        <ul className="space-y-1.5">
          {decision.reasons.map((r, i) => (
            <li key={i} className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
              {r.text}
            </li>
          ))}
          {decision.risk && (
            <li className="flex items-start gap-2 text-xs text-gray-700">
              <span className="text-indigo-400 mt-0.5 shrink-0">•</span>
              {decision.risk}
            </li>
          )}
        </ul>
      )}
    </div>
  )
}
