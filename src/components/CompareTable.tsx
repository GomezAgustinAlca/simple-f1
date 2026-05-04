import { getPerformanceLevel, getTrend, getRecentPerformance } from "@/lib/performance"
import { getCompareMotivo } from "@/lib/summaries"
import type { DriverPerformanceSummary, RaceResult } from "@/types/f1"

interface CompareTableProps {
  nameA: string
  nameB: string
  summaryA: DriverPerformanceSummary
  summaryB: DriverPerformanceSummary
  resultsA: RaceResult[]
  resultsB: RaceResult[]
  isPremium: boolean
}

function Cell({ value, better }: { value: string; better: boolean }) {
  return (
    <td
      className={`py-4 px-4 text-center font-semibold text-sm ${
        better ? "text-indigo-700 bg-indigo-50" : "text-gray-700"
      }`}
    >
      {value}
    </td>
  )
}

export function CompareTable({ nameA, nameB, summaryA, summaryB, resultsA, resultsB, isPremium }: CompareTableProps) {
  const levelA = getPerformanceLevel(summaryA.seasonAveragePosition)
  const levelB = getPerformanceLevel(summaryB.seasonAveragePosition)
  const trendA = getTrend(resultsA)
  const trendB = getTrend(resultsB)
  const recentA = getRecentPerformance(summaryA.lastFiveAveragePosition, summaryA.racesCount)
  const recentB = getRecentPerformance(summaryB.lastFiveAveragePosition, summaryB.racesCount)

  const rows = [
    {
      label: "Puntos temporada",
      a: String(summaryA.totalPoints),
      b: String(summaryB.totalPoints),
      betterA: summaryA.totalPoints >= summaryB.totalPoints,
    },
    {
      label: "Nivel",
      a: levelA,
      b: levelB,
      betterA: (summaryA.seasonAveragePosition ?? 99) <= (summaryB.seasonAveragePosition ?? 99),
    },
    {
      label: "Tendencia",
      a: trendA,
      b: trendB,
      betterA: trendA === trendB ? true : trendA === "Mejora",
    },
    {
      label: "Rendimiento reciente",
      a: recentA,
      b: recentB,
      betterA: (summaryA.lastFiveAveragePosition ?? 99) <= (summaryB.lastFiveAveragePosition ?? 99),
    },
    {
      label: "Mejor resultado",
      a: summaryA.bestFinish != null ? `P${summaryA.bestFinish}` : "—",
      b: summaryB.bestFinish != null ? `P${summaryB.bestFinish}` : "—",
      betterA: (summaryA.bestFinish ?? 99) <= (summaryB.bestFinish ?? 99),
    },
    {
      label: "Carreras terminadas",
      a: String(summaryA.racesCount - summaryA.dnfs),
      b: String(summaryB.racesCount - summaryB.dnfs),
      betterA: summaryA.racesCount - summaryA.dnfs >= summaryB.racesCount - summaryB.dnfs,
    },
    {
      label: "DNFs",
      a: String(summaryA.dnfs),
      b: String(summaryB.dnfs),
      betterA: summaryA.dnfs <= summaryB.dnfs,
    },
  ]

  const aWins = rows.filter((r) => r.betterA).length
  const bWins = rows.length - aWins
  const advantageName = aWins > bWins ? nameA : bWins > aWins ? nameB : null

  const conclusionTitle = advantageName ? `${advantageName} está mejor actualmente` : "Están equilibrados actualmente"
  const conclusionMotivo = getCompareMotivo(summaryA, summaryB, nameA, nameB, advantageName)

  return (
    <div className="space-y-3">
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-100">
              <th className="py-4 px-4 text-left text-xs text-gray-400 uppercase tracking-wide font-medium">
                Estadística
              </th>
              <th className="py-4 px-4 text-center text-sm font-bold text-gray-900 bg-gray-50">
                {nameA}
              </th>
              <th className="py-4 px-4 text-center text-sm font-bold text-gray-900">
                {nameB}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            {rows.map((row) => (
              <tr key={row.label}>
                <td className="py-4 px-4 text-sm text-gray-600">{row.label}</td>
                <Cell value={row.a} better={row.betterA} />
                <Cell value={row.b} better={!row.betterA} />
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Conclusion */}
      <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-5">
        <p className="text-sm font-semibold text-indigo-700 mb-1">{conclusionTitle}</p>
        {isPremium ? (
          <p className="text-gray-600 text-sm">Motivo: {conclusionMotivo}</p>
        ) : (
          <div className="flex items-center gap-3">
            <p className="text-gray-600 text-sm blur-sm select-none flex-1">Motivo: {conclusionMotivo}</p>
            <a
              href="https://simplef1.lemonsqueezy.com/checkout/buy/a17d801a-9e92-4da7-9e2b-e314c6d30906"
              target="_blank"
              rel="noopener noreferrer"
              className="shrink-0 text-xs font-semibold text-indigo-700 bg-white px-3 py-1.5 rounded-full border border-indigo-200 shadow-sm hover:shadow-md transition-shadow whitespace-nowrap"
            >
              Ver por qué
            </a>
          </div>
        )}
      </div>
    </div>
  )
}
